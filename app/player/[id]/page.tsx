"use client"

import { useState, useEffect } from "react"
import {
  getPlayer,
  getPlayer as getTargetPlayer,
  createKillRequest,
  getPendingKillRequest,
  confirmKill,
  rejectKill,
  type PlayerWithTargetMission,
} from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, AlertTriangle, Check, X } from "lucide-react"

export default function PlayerDashboard({ params }: { params: { id: string } }) {
  const [player, setPlayer] = useState<PlayerWithTargetMission | undefined>(getPlayer(params.id))
  const [target, setTarget] = useState(player?.targetId ? getTargetPlayer(player.targetId) : null)
  const [pendingRequest, setPendingRequest] = useState<any>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)

  useEffect(() => {
    if (player) {
      const request = getPendingKillRequest(player.id)
      setPendingRequest(request)
    }
  }, [player])

  const handleKill = () => {
    if (player && target) {
      createKillRequest(player.id, target.id)
      setShowConfirmation(true)
    }
  }

  const handleConfirmKill = () => {
    if (pendingRequest) {
      confirmKill(pendingRequest.id)
      setPendingRequest(null)
      // Rafraîchir les données du joueur
      const updatedPlayer = getPlayer(params.id)
      setPlayer(updatedPlayer)
      if (updatedPlayer) {
        setTarget(updatedPlayer.targetId ? getTargetPlayer(updatedPlayer.targetId) : null)
      }
    }
  }

  const handleRejectKill = () => {
    if (pendingRequest) {
      rejectKill(pendingRequest.id)
      setPendingRequest(null)
    }
  }

  if (!player) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Joueur non trouvé</CardTitle>
            <CardDescription>Le joueur demandé n'existe pas ou a été supprimé.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href="/login">
              <Button>Retour à la connexion</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (!player.isAlive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-destructive/10 p-4">
        <Card className="w-full max-w-md border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Vous êtes mort</CardTitle>
            <CardDescription>Vous avez été éliminé du jeu. Merci d'avoir participé !</CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href="/login">
              <Button variant="outline">Retour à la connexion</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <div className="container mx-auto max-w-4xl">
        <Link href="/login" className="inline-flex items-center gap-1 mb-6 text-primary hover:underline">
          <ArrowLeft size={16} /> Retour à la connexion
        </Link>

        <div className="grid gap-6">
          {/* En-tête */}
          <Card>
            <CardHeader>
              <CardTitle>Dashboard de {player.name}</CardTitle>
              <CardDescription>
                Code: <span className="font-mono">{player.code}</span>
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Demande de confirmation de meurtre */}
          {pendingRequest && (
            <Card className="border-destructive">
              <CardHeader className="bg-destructive/10">
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="text-destructive" size={18} />
                  Quelqu'un tente de vous éliminer !
                </CardTitle>
                <CardDescription>Un autre joueur affirme vous avoir éliminé. Est-ce vrai ?</CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleRejectKill}>
                  <X className="mr-2" size={16} /> Rejeter
                </Button>
                <Button variant="destructive" onClick={handleConfirmKill}>
                  <Check className="mr-2" size={16} /> Confirmer
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* Cible et sa mission */}
          <Card>
            <CardHeader>
              <CardTitle>Votre cible</CardTitle>
            </CardHeader>
            <CardContent>
              {target ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold">{target.name}</h3>
                  </div>
                  {player.targetMission ? (
                    <div>
                      <h4 className="text-lg font-semibold">Mission à accomplir sur la cible :</h4>
                      <p className="text-lg font-medium mt-2">{player.targetMission.title}</p>
                      <p className="mt-2">{player.targetMission.description}</p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Aucune mission spécifique assignée pour cette cible.</p>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">Aucune cible assignée pour le moment.</p>
              )}
            </CardContent>
            <CardFooter>
              {target && (
                <Button variant="destructive" className="w-full" onClick={handleKill} disabled={showConfirmation}>
                  {showConfirmation ? "Demande envoyée" : "Tuer"}
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

