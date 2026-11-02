"use client"

import { useRef, type ElementType } from "react"
import { cn } from "@/lib/utils"
import { gsap, SplitText, useGSAP } from "./gsap"
import { useFx } from "./useFx"

interface Props {
  text: string
  as?: ElementType
  className?: string
  delay?: number
  by?: "chars" | "words"
}

/** Revela um título letra a letra (ou palavra a palavra). */
export function SplitReveal({ text, as: Tag = "h1", className, delay = 0, by = "chars" }: Props) {
  const ref = useRef<HTMLElement>(null)
  const fx = useFx()

  useGSAP(
    () => {
      if (!ref.current || !fx.motion) return
      const split = SplitText.create(ref.current, { type: by === "chars" ? "words,chars" : "words", aria: "auto" })
      const targets = by === "chars" ? split.chars : split.words
      gsap.from(targets, {
        opacity: 0,
        y: 18,
        filter: "blur(8px)",
        duration: 0.9,
        ease: "power3.out",
        stagger: by === "chars" ? 0.025 : 0.08,
        delay,
      })
      return () => split.revert()
    },
    { scope: ref, dependencies: [text, fx.motion] },
  )

  return (
    <Tag ref={ref} className={cn(className)}>
      {text}
    </Tag>
  )
}
