// Teclas do passador de slides. A maioria envia Page Down/Page Up; outros,
// as setas. O botão de "iniciar apresentação" costuma enviar F5 (aqui vira
// tela cheia, em vez de recarregar a página) e o de "tela preta", B ou ponto.

export type ClickerAction = "next" | "prev" | "blank" | "fullscreen"

export function clickerAction(e: KeyboardEvent, { verticalArrows = false } = {}): ClickerAction | null {
  if (e.altKey || e.ctrlKey || e.metaKey) return null
  switch (e.key) {
    case "PageDown":
    case "ArrowRight":
    case " ":
      return "next"
    case "PageUp":
    case "ArrowLeft":
      return "prev"
    case "ArrowDown":
      return verticalArrows ? "next" : null
    case "ArrowUp":
      return verticalArrows ? "prev" : null
    case "b":
    case "B":
    case ".":
      return "blank"
    case "F5":
    case "f":
    case "F":
      return "fullscreen"
  }
  return null
}
