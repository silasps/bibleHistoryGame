"use client"

import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin"
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin"
import { MotionPathPlugin } from "gsap/MotionPathPlugin"
import { SplitText } from "gsap/SplitText"

gsap.registerPlugin(useGSAP, DrawSVGPlugin, MorphSVGPlugin, MotionPathPlugin, SplitText)

export { gsap, useGSAP, SplitText }
