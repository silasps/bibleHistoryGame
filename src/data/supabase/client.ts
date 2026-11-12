"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  castLiveVote,
  joinLiveRoom,
  liveHostCommand,
  lightLive,
  playLive,
} from "@/app/actions/live";
import type { LinkState } from "@/components/story/ConnectionStatus";
import { getEvidence, sequenceScenes } from "@/content";
import {
  toProjectorView,
  type AudienceView,
  type ProjectorView,
} from "@/domain/projection";
import {
  reduceHost,
  type HostCommand,
  type SessionState,
} from "@/domain/session";
import {
  joinUrlFor,
  siteOrigin,
  type AudienceRoomApi,
  type HostRoomApi,
  type ProjectorControl,
  type ProjectorRoomApi,
} from "../ports";
import { newerView, openRelay, type Relay } from "./relay";

type Scope = "stage" | "votes" | "people" | "lights" | "plays";

let browserClient: SupabaseClient | null = null;

/** Cliente anônimo, usado só para ouvir os avisos da sala (realtime). */
function realtime(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  browserClient ??= createClient(url, key, { auth: { persistSession: false } });
  return browserClient;
}

/**
 * Busca a view da rota e a refaz quando chega um aviso da sala. Buscas
 * simultâneas são agrupadas; sem realtime, cai para polling.
 */
function useSyncedResource<T>(
  code: string,
  path: string,
  scopes: Scope[],
  accept?: (prev: T | null, next: T) => boolean,
) {
  const [data, setData] = useState<T | null>(null);
  const acceptRef = useRef(accept);
  const force = useRef(false);
  const [link, setLink] = useState<LinkState>("conectando");
  const [error, setError] = useState<string | null>(null);
  const inflight = useRef(false);
  const pending = useRef(false);
  const scopeKey = scopes.join(",");

  /** `forced`: aceita o que vier do servidor, mesmo mais velho (ex.: comando recusado). */
  const refetch = useCallback(
    async (forced = false) => {
      if (forced) force.current = true;
      if (inflight.current) {
        pending.current = true;
        return;
      }
      inflight.current = true;
      try {
        do {
          pending.current = false;
          try {
            const res = await fetch(`/api/rooms/${code}/${path}`, {
              cache: "no-store",
            });
            const body = await res.json();
            if (res.ok) {
              const forcedNow = force.current;
              force.current = false;
              setData((prev) =>
                forcedNow ||
                !acceptRef.current ||
                acceptRef.current(prev, body as T)
                  ? (body as T)
                  : prev,
              );
              setError(null);
            } else setError(body.error ?? "Erro ao carregar a sala");
          } catch {
            setLink("offline");
          }
        } while (pending.current);
      } finally {
        inflight.current = false;
      }
    },
    [code, path],
  );

  useEffect(() => {
    const client = realtime();
    const wanted = new Set(scopeKey.split(","));
    void refetch();
    let poll: ReturnType<typeof setInterval> | undefined;
    const startPolling = () => {
      poll ??= setInterval(() => void refetch(), 4000);
    };
    const stopPolling = () => {
      if (poll) clearInterval(poll);
      poll = undefined;
    };
    const channel = client
      ?.channel(`room:${code}`)
      .on("broadcast", { event: "sync" }, ({ payload }) => {
        if (wanted.has((payload as { scope: Scope }).scope)) void refetch();
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setLink("conectado");
          stopPolling();
          void refetch(); // pega o que mudou enquanto reconectava
        } else if (
          status === "CHANNEL_ERROR" ||
          status === "TIMED_OUT" ||
          status === "CLOSED"
        ) {
          setLink("offline");
          startPolling();
        }
      });
    if (!channel) startPolling();
    const onWake = () =>
      document.visibilityState === "visible" && void refetch();
    document.addEventListener("visibilitychange", onWake);
    window.addEventListener("online", onWake);
    return () => {
      stopPolling();
      document.removeEventListener("visibilitychange", onWake);
      window.removeEventListener("online", onWake);
      if (channel) void client?.removeChannel(channel);
    };
  }, [code, scopeKey, refetch]);

  return { data, setData, link, error, refetch };
}

export function useLiveHost(
  code: string,
): HostRoomApi & { error: string | null } {
  const { data, setData, link, error, refetch } =
    useSyncedResource<SessionState>(
      code,
      "host",
      ["stage", "votes", "people", "lights", "plays"],
      newerView,
    );
  const current = useRef<SessionState | null>(null);
  useEffect(() => {
    current.current = data;
  }, [data]);

  const command = useCallback(
    async (cmd: HostCommand) => {
      // Aplica na hora com o mesmo reducer do servidor; a resposta da rede só confirma.
      const before = current.current;
      if (before) {
        const local = reduceHost(before, cmd, {
          now: Date.now(),
          narrative: { scenes: sequenceScenes(before.sequenceId) },
        });
        if (local.error) return local.error;
        current.current = local.state;
        setData(local.state);
      }
      const res = await liveHostCommand(code, cmd);
      if (res.error) {
        void refetch(true); // desfaz o que foi aplicado na hora
        return res.error;
      }
      const stage = res.state;
      if (stage) {
        // O servidor devolve só o palco: preserva votos, participantes e luzes já conhecidos.
        // Uma resposta atrasada (versão mais velha) não desfaz comandos mais novos.
        setData((prev) =>
          prev && stage.version < prev.version
            ? prev
            : prev
              ? {
                  ...stage,
                  participants: prev.participants,
                  lights: prev.lights,
                  plays: prev.plays,
                  polls: Object.fromEntries(
                    Object.entries(stage.polls).map(([id, p]) => [
                      id,
                      { ...p, votes: prev.polls[id]?.votes ?? {} },
                    ]),
                  ),
                }
              : stage,
        );
      }
      return undefined;
    },
    [code, setData, refetch],
  );

  // Telão no mesmo navegador: recebe a view pronta e repassa o passador de slides.
  const relay = useRef<Relay | null>(null);
  const commandRef = useRef(command);
  useEffect(() => {
    commandRef.current = command;
  }, [command]);
  useEffect(() => {
    const r = openRelay(code, (m) => {
      if (m.t === "control") void commandRef.current({ type: m.cmd });
    });
    relay.current = r;
    const beat = setInterval(() => r?.post({ t: "host" }), 2000);
    r?.post({ t: "host" });
    return () => {
      clearInterval(beat);
      r?.close();
      relay.current = null;
    };
  }, [code]);
  useEffect(() => {
    if (data)
      relay.current?.post({
        t: "view",
        view: toProjectorView(
          data,
          { scenes: sequenceScenes(data.sequenceId) },
          getEvidence,
        ),
      });
  }, [data]);

  return { mode: "live", state: data, link, command, error };
}

export function useLiveProjector(
  code: string,
): ProjectorRoomApi & { error: string | null } {
  const { data, setData, link, error } = useSyncedResource<ProjectorView>(
    code,
    "projector",
    ["stage", "votes", "people", "lights", "plays"],
    newerView,
  );
  // Painel aberto neste navegador: a view chega pelo atalho local, antes da rede.
  const relay = useRef<Relay | null>(null);
  const hostSeenAt = useRef(0);
  useEffect(() => {
    const r = openRelay(code, (m) => {
      if (m.t === "control") return;
      hostSeenAt.current = Date.now();
      if (m.t === "view")
        setData((prev) => (newerView(prev, m.view) ? m.view : prev));
    });
    relay.current = r;
    return () => {
      r?.close();
      relay.current = null;
    };
  }, [code, setData]);
  // Passador com o foco no telão: pelo painel deste navegador (instantâneo) ou pelo servidor,
  // que só aceita se este navegador for o do apresentador (cookie da sala).
  const control = useCallback(
    async (cmd: ProjectorControl) => {
      if (relay.current && Date.now() - hostSeenAt.current < 5000) {
        relay.current.post({ t: "control", cmd });
        return undefined;
      }
      return (await liveHostCommand(code, { type: cmd })).error;
    },
    [code],
  );
  return {
    view: data,
    link,
    error,
    joinUrl: joinUrlFor(code, "live", siteOrigin()),
    control,
  };
}

export function useLiveAudience(
  code: string,
): AudienceRoomApi & { error: string | null } {
  // O público só refaz a busca em mudanças de palco e nas próprias ações:
  // votos dos outros não geram tráfego em todos os celulares.
  const { data, link, error, refetch } = useSyncedResource<AudienceView>(
    code,
    "audience",
    ["stage"],
  );
  const join = useCallback(
    async (nickname?: string) => {
      const res = await joinLiveRoom(code, nickname);
      await refetch();
      return res.error;
    },
    [code, refetch],
  );
  const vote = useCallback(
    async (pollId: string, optionId: string) => {
      const res = await castLiveVote(code, pollId, optionId);
      await refetch();
      return res.error;
    },
    [code, refetch],
  );
  const light = useCallback(async () => {
    await lightLive(code);
    await refetch();
  }, [code, refetch]);
  // O jogo roda no próprio celular; o envio só soma na sala (sem refazer a busca).
  const play = useCallback(
    async (gameId: string, value: number, done: boolean) => {
      await playLive(code, gameId, value, done);
    },
    [code],
  );
  return {
    view: data,
    link,
    error,
    joined: !!data?.me,
    join,
    vote,
    light,
    play,
  };
}
