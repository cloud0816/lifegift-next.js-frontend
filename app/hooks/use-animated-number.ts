import { useEffect, useState } from "react"

interface UseAnimatedNumberOptions {
  duration?: number
  startValue?: number
  decimals?: number
  formatter?: (value: number) => string
}

export function useAnimatedNumber(
  targetValue: number,
  options: UseAnimatedNumberOptions = {}
) {
  const {
    duration = 1500,
    startValue = 0,
    decimals = 2,
    formatter,
  } = options

  const [displayValue, setDisplayValue] = useState(startValue)

  useEffect(() => {
    if (targetValue === startValue) {
      setDisplayValue(targetValue)
      return
    }

    const startTime = Date.now()
    const start = startValue
    const end = targetValue
    const range = end - start

    const animate = () => {
      const now = Date.now()
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const current = start + range * easeOut

      setDisplayValue(current)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setDisplayValue(end)
      }
    }

    const animationFrame = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationFrame)
    }
  }, [targetValue, duration, startValue])

  if (formatter) {
    return formatter(displayValue)
  }

  // Round to specified decimals
  const rounded = Math.round(displayValue * Math.pow(10, decimals)) / Math.pow(10, decimals)
  return rounded
}

