import { useForm } from "react-hook-form"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "./ui/form"
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from "@/components/ui/input"
import { Button } from "./ui/button"
import { Switch } from "./ui/switch"
import { useState } from "react"
import { toast } from "sonner"
import { Textarea } from "./ui/textarea"
import { Sparkles, AlertCircle, Copy, CheckCircle2 } from "lucide-react"
import { Card, CardContent } from "./ui/card"
import { Alert, AlertDescription, AlertTitle } from "./ui/alert"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import createToken from "@/utils/createToken"
import { Separator } from "./ui/separator"

const formSchema = z.object({
  TokenName: z.string().min(2, {
    message: "Token name must be at least 2 characters."
  }).max(20, {
    message: "Token name cannot exceed 20 characters."
  }),
  ImageUrl: z.string().url({
    message: "Please enter a valid URL."
  }),
  InitialSupply: z.number().positive({
    message: "Supply must be a positive number."
  }),
  Symbol: z.string().min(2, {
    message: "Symbol must be at least 2 characters."
  }).max(8, {
    message: "Symbol cannot exceed 8 characters."
  }),
  Decimal: z.number().min(0, {
    message: "Decimals must be at least 0."
  }).max(9, {
    message: "Decimals cannot exceed 9."
  }),
  RevokeMint: z.boolean(),
  RevokeFreeze: z.boolean(),
  Description: z.union([
    z.string().min(8, {
      message: "Description must be at least 8 characters."
    }).max(50, {
      message: "Description cannot exceed 50 characters."
    }),
    z.string().max(0)
  ]).optional()
})

export type FormSchema = z.infer<typeof formSchema>

const TokenLaunchpadForm = () => {
  const { connection } = useConnection()
  const { publicKey, sendTransaction, connected } = useWallet()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tokenAddress, setTokenAddress] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      TokenName: "",
      ImageUrl: "",
      InitialSupply: 1000,
      Symbol: "",
      Decimal: 9,
      RevokeMint: false,
      RevokeFreeze: false,
      Description: ""
    }
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!publicKey || !connected) {
      toast.error("Please connect your wallet first")
      return
    }

    setIsSubmitting(true)
    setTokenAddress(null)

    console.log(values);

    try {
      const data = await createToken(connection, publicKey, values, sendTransaction)
      toast.success("Token created successfully!")
      setTokenAddress(data.mintAddress)
      form.reset()
    } catch (error: unknown) {
      console.error("Error creating token:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to create token"
      toast.error(`Error: ${errorMessage}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const copyToClipboard = () => {
    if (tokenAddress) {
      navigator.clipboard.writeText(tokenAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast.success("Address copied to clipboard")
    }
  }

  return (
    <div className="space-y-4">
      <Card className="border-border">
        <CardContent className="p-6">
          {tokenAddress && (
            <Alert className="mb-6 border-border">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle className="font-medium">Token Created Successfully</AlertTitle>
              <AlertDescription>
                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  <code className="px-2 py-1 bg-muted rounded text-xs font-mono">{tokenAddress}</code>
                  <button
                    onClick={copyToClipboard}
                    className="p-1 rounded hover:bg-muted transition-colors"
                    aria-label="Copy address"
                  >
                    {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left column */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Token Details</h3>

                  <FormField
                    control={form.control}
                    name="TokenName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Token Name</FormLabel>
                        <FormControl>
                          <Input placeholder="My Token" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="Symbol"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Symbol</FormLabel>
                        <FormControl>
                          <Input placeholder="TKN" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="InitialSupply"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Initial Supply</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="1000"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="Decimal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Decimals</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="9"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">Standard: 9 decimals</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Right column */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Metadata & Settings</h3>

                  <FormField
                    control={form.control}
                    name="ImageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Image URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="Description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">
                          Description <span className="text-muted-foreground font-normal">(optional)</span>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Token description"
                            className="resize-none h-20"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          {(field.value ?? "").length}/50 characters
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-3 pt-2">
                    <FormField
                      control={form.control}
                      name="RevokeMint"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between p-3 rounded-md border border-border">
                          <div className="space-y-0.5">
                            <FormLabel className="text-sm cursor-pointer">
                              Revoke Mint Authority
                            </FormLabel>
                            <FormDescription className="text-xs">
                              Prevents creating more tokens
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="RevokeFreeze"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between p-3 rounded-md border border-border">
                          <div className="space-y-0.5">
                            <FormLabel className="text-sm cursor-pointer">
                              Revoke Freeze Authority
                            </FormLabel>
                            <FormDescription className="text-xs">
                              Prevents freezing token accounts
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                {!publicKey && (
                  <Alert className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle className="text-sm">Wallet not connected</AlertTitle>
                    <AlertDescription className="text-xs">
                      Connect your wallet to create a token
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full h-10"
                  disabled={isSubmitting || !publicKey}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                      Creating Token...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Create Token
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

export default TokenLaunchpadForm
