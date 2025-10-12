import TokenLauchpadForm from "@/components/TokenLauchpadForm"
import { Github } from "lucide-react"
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { ModeToggle } from '@/components/mode-toggle'
import { NetworkSelector } from '@/components/NetworkSelector'
import { useNetwork } from '@/context/NetworkContext'
import AirdropSol from '@/components/airdrop-sol'
import { Card } from "@/components/ui/card"

const App = () => {
  const { network } = useNetwork()
  const isDevnet = network === 'devnet'

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 sticky top-0 z-10 bg-background">
        <div className="container mx-auto px-4 h-16 flex justify-between items-center">
          <h1 className="text-lg font-semibold">
            Solana Token Launchpad
          </h1>
          <a
            href="https://github.com/idityaGE/Solana-Token-Lauchpad"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Github size={16} />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 sm:py-8">
        <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
          {/* Wallet Connection Card */}
          <Card className="p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row items-stretch gap-7 sm:gap-4">
              <div className="flex items-center justify-between gap-2 sm:gap-3 flex-wrap">
                <NetworkSelector />
                {isDevnet && <AirdropSol />}
              </div>
              <div className="flex items-center justify-between gap-2 sm:ml-auto flex-wrap">
                <WalletMultiButton />
                <ModeToggle />
              </div>
            </div>
          </Card>

          <TokenLauchpadForm />
        </div>
      </main>
    </div>
  )
}

export default App
