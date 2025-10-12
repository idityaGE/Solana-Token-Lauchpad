import { useState } from 'react'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { toast } from 'sonner'
import { WalletNotConnectedError } from '@solana/wallet-adapter-base'
import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from './ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { Coins } from 'lucide-react'
import { Label } from './ui/label'

const AirdropSol = () => {
  const { connection } = useConnection()
  const { publicKey } = useWallet()
  const [amount, setAmount] = useState("1")
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const airdropSol = async () => {
    if (!publicKey) return new WalletNotConnectedError()

    try {
      setIsLoading(true)

      // Request airdrop of selected amount in SOL
      const lamports = parseInt(amount) * LAMPORTS_PER_SOL
      const signature = await connection.requestAirdrop(publicKey, lamports)

      // Wait for confirmation
      await connection.confirmTransaction(signature)

      // Show success message
      toast.success(`Successfully airdropped ${amount} SOL to your wallet!`)
      setOpen(false)
    } catch (error: unknown) {
      console.error('Failed to airdrop SOL:', error)

      // Extract the meaningful part of the error message
      let errorMessage = 'Failed to airdrop SOL'

      // Handle the specific error format from Solana API
      if (error && typeof error === 'object' && 'message' in error) {
        const errorObj = error as { message: string }
        try {
          // Check if this is a JSON RPC error
          if (errorObj.message.includes('429')) {
            errorMessage = 'Airdrop limit reached or faucet has run dry. Try again later or visit faucet.solana.com'
          } else if (errorObj.message.includes('JSON')) {
            // Try to parse the JSON part of the error
            const match = errorObj.message.match(/{.*}/s)
            if (match) {
              const jsonData = JSON.parse(match[0])
              if (jsonData.error && jsonData.error.message) {
                errorMessage = jsonData.error.message
              }
            }
          } else {
            // Just use the error message directly
            errorMessage = errorObj.message
          }
        } catch {
          // If parsing fails, use the original message
          errorMessage = `${errorMessage}: ${errorObj.message}`
        }
      }

      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Coins className="h-4 w-4" />
          <span className="hidden sm:inline">Airdrop</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Airdrop SOL</DialogTitle>
          <DialogDescription>
            Request an airdrop of SOL to your wallet (works only on devnet and testnet).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="amount-select" className="text-sm">
              Amount to Airdrop
            </Label>
            <Select
              value={amount}
              onValueChange={setAmount}
              disabled={isLoading}
            >
              <SelectTrigger id="amount-select">
                <SelectValue placeholder="Select amount" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((value) => (
                  <SelectItem key={value} value={value.toString()}>
                    {value} SOL
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <p className="text-xs text-muted-foreground w-full sm:w-auto">
            Note: Airdrops are limited by network policies.
          </p>
          <Button
            onClick={airdropSol}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              `Airdrop ${amount} SOL`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AirdropSol
