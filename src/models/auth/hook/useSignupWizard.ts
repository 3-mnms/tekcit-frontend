// features/auth/signup/hooks/useSignupWizard.ts
import { useMemo, useState } from 'react'
import { signupFinalSchema, type Step1, type Step2, type Step3, type Step4 } from '@/models/auth/schema/signupSchema'

const TOTAL_STEPS = 4
type Acc = Partial<Step1 & Step2 & Step3 & Step4>

export function useSignupWizard() {
  const [step, setStep] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [isEmailCodeSent, setIsEmailCodeSent] = useState(false)
  const [acc, setAcc] = useState<Acc>({})
  const progress = useMemo(() => ((step - 1) / (TOTAL_STEPS - 1)) * 100, [step])

  const updateAcc = (data: Partial<Acc>) => setAcc((p) => ({ ...p, ...data }))
  const next = () => setStep((s) => Math.min(TOTAL_STEPS, s + 1))
  const prev = () => setStep((s) => Math.max(1, s - 1))

  const handleAddressComplete = (data: { zipCode: string; address: string }) => {
    updateAcc({ zipCode: data.zipCode, address: data.address })
    setShowModal(false)
  }

  const parseFinal = () => signupFinalSchema.safeParse(acc)

  return {
    // state
    step, progress, showModal, isEmailCodeSent, acc,
    // setters
    setShowModal, setIsEmailCodeSent, updateAcc,
    // nav
    next, prev,
    // helpers
    handleAddressComplete, parseFinal,
  }
}