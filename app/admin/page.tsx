"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  getPlayers,
  getMissions,
  addPlayer,
  addMission,
  deletePlayer,
  deleteMission,
  resetGame,
  assignMissionsAndTargets,
  assignMissionToPlayer,
  getKillCountByPlayer,
  getPlayerWithMostKills,
  getKillHistory,
  type Player,
  type Mission,
} from "@/lib/data"
import { generatePlayerCode } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Plus, Trash, RefreshCw, PlayCircle, LogOut, Trophy, Clock } from "lucide-react"

export default function AdminPage() {
  const [players, setPlayers] = useState<Player[]>([])
  const [missions, setMissions] = useState<Mission[]>([])
  const [newPlayerName, setNewPlayerName] = useState("")
  const [newMissionTitle, setNewMissionTitle] = useState("")
  const [newMissionDescription, setNewMissionDescription] = useState("")
  const [killCounts, setKillCounts] = useState<{ [playerId: string]: number }>({})
  const [topKiller, setTopKiller] = useState<Player | null>(null)
  const [killHistory, setKillHistory] = useState<Array<{ killer: Player; target: Player; timestamp: Date }>>([])
  const router = useRouter()

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("adminAuthenticated") === "true"
    if (!isAuthenticated) {
      router.push("/admin/login")
    } else {
      refreshData()
    }
  }, [router])

  const refreshData = async () => {
    setPlayers(await getPlayers())
    setMissions(await getMissions())
    setKillCounts(await getKillCountByPlayer())
    setTopKiller(await getPlayerWithMostKills())
    setKillHistory(await getKillHistory())
  }

  const handleLogout = () => {
    localStorage.removeItem("adminAuthenticated")
    router.push("/admin/login")
  }

  // Gestion des joueurs
  const handleAddPlayer = async () => {
    if (newPlayerName.trim()) {
      const code = generatePlayerCode()
      await addPlayer(newPlayerName, code)
      setPlayers(await getPlayers())
      setNewPlayerName("")
    }
  }

  const handleDeletePlayer = async (id: string) => {
    await deletePlayer(id)
    setPlayers(await getPlayers())
  }

  // Gestion des missions
  const handleAddMission = async () => {
    if (newMissionTitle.trim() && newMissionDescription.trim()) {
      await addMission(newMissionTitle, newMissionDescription)
      setMissions(await getMissions())
      setNewMissionTitle("")
      setNewMissionDescription("")
    }
  }

  const handleDeleteMission = async (id: string) => {
    await deleteMission(id)
    setMissions(await getMissions())
  }

  // Gestion du jeu
  const handleResetGame = async () => {
    if (confirm("Êtes-vous sûr de vouloir réinitialiser le jeu ? Tous les joueurs seront supprimés.")) {
      await resetGame()
      setPlayers(await getPlayers())
    }
  }

  const handleStartGame = async () => {
    await assignMissionsAndTargets()
    setPlayers(await getPlayers())
  }

  const handleAssignMission = async (playerId: string, missionId: string) => {
    await assignMissionToPlayer(playerId, missionId)
    setPlayers(await getPlayers())
  }

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <Link href="/" className="inline-flex items-center gap-1 text-primary hover:underline">
            <ArrowLeft size={16} /> Retour à l'accueil
          </Link>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Déconnexion
          </Button>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Administration du Murder Game</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleResetGame}>
            <RefreshCw className="mr-2 h-4 w-4" /> Réinitialiser
          </Button>
          <Button onClick={handleStartGame}>
            <PlayCircle className="mr-2 h-4 w-4" /> Commencer le jeu
          </Button>
        </div>
      </div>

      <Tabs defaultValue="players">
        <TabsList className="mb-6">
          <TabsTrigger value="players">Joueurs</TabsTrigger>
          <TabsTrigger value="missions">Missions</TabsTrigger>
          <TabsTrigger value="stats">Statistiques</TabsTrigger>
        </TabsList>

        <TabsContent value="players" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ajouter un joueur</CardTitle>
              <CardDescription>Ajoutez un nouveau joueur au jeu. Un code unique lui sera attribué.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-4">
                <div className="grid w-full gap-1.5">
                  <Label htmlFor="playerName">Nom du joueur</Label>
                  <Input
                    id="playerName"
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    placeholder="Entrez le nom du joueur"
                  />
                </div>
                <Button onClick={handleAddPlayer}>
                  <Plus className="mr-2 h-4 w-4" /> Ajouter
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Liste des joueurs</CardTitle>
              <CardDescription>{players.length} joueur(s) dans le jeu</CardDescription>
            </CardHeader>
            <CardContent>
              {players.length === 0 ? (
                <p className="text-muted-foreground">Aucun joueur pour le moment</p>
              ) : (
                <div className="space-y-4">
                  {players.map((player) => (
                    <div
                      key={player.id}
                      className={`flex items-center justify-between p-3 border rounded-md ${!player.isAlive ? "bg-muted" : ""}`}
                    >
                      <div className="flex-grow">
                        <div className="font-medium">
                          {player.name} {!player.isAlive && <span className="text-destructive">(Mort)</span>}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Code: <span className="font-mono">{player.code}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select
                          value={player.missionId || ""}
                          onValueChange={(value) => handleAssignMission(player.id, value)}
                        >
                          <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Assigner une mission" />
                          </SelectTrigger>
                          <SelectContent>
                            {missions.map((mission) => (
                              <SelectItem key={mission.id} value={mission.id}>
                                {mission.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button variant="ghost" size="icon" onClick={() => handleDeletePlayer(player.id)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="missions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ajouter une mission</CardTitle>
              <CardDescription>Créez une nouvelle mission qui sera attribuée aux joueurs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="missionTitle">Titre de la mission</Label>
                  <Input
                    id="missionTitle"
                    value={newMissionTitle}
                    onChange={(e) => setNewMissionTitle(e.target.value)}
                    placeholder="Entrez le titre de la mission"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="missionDescription">Description</Label>
                  <Textarea
                    id="missionDescription"
                    value={newMissionDescription}
                    onChange={(e) => setNewMissionDescription(e.target.value)}
                    placeholder="Décrivez comment la mission doit être accomplie"
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleAddMission}>
                <Plus className="mr-2 h-4 w-4" /> Ajouter la mission
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Liste des missions</CardTitle>
              <CardDescription>{missions.length} mission(s) disponible(s)</CardDescription>
            </CardHeader>
            <CardContent>
              {missions.length === 0 ? (
                <p className="text-muted-foreground">Aucune mission pour le moment</p>
              ) : (
                <div className="space-y-4">
                  {missions.map((mission) => (
                    <div key={mission.id} className="p-3 border rounded-md">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{mission.title}</div>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteMission(mission.id)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="mt-2 text-sm">{mission.description}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Statistiques du jeu</CardTitle>
              <CardDescription>Aperçu des performances des joueurs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Top Killer */}
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center">
                    <Trophy className="mr-2 h-5 w-5 text-yellow-500" />
                    Meilleur tueur
                  </h3>
                  {topKiller ? (
                    <p>
                      {topKiller.name} avec {killCounts[topKiller.id]} kills
                    </p>
                  ) : (
                    <p>Aucun kill enregistré</p>
                  )}
                </div>

                {/* Kill Counts */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Nombre de kills par joueur</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Joueur</TableHead>
                        <TableHead>Nombre de kills</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(killCounts).map(([playerId, count]) => {
                        const player = players.find((p) => p.id === playerId)
                        return player ? (
                          <TableRow key={playerId}>
                            <TableCell>{player.name}</TableCell>
                            <TableCell>{count}</TableCell>
                          </TableRow>
                        ) : null
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Kill History */}
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center">
                    <Clock className="mr-2 h-5 w-5" />
                    Historique des kills
                  </h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tueur</TableHead>
                        <TableHead>Cible</TableHead>
                        <TableHead>Date et heure</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {killHistory.map((record, index) => (
                        <TableRow key={index}>
                          <TableCell>{record.killer.name}</TableCell>
                          <TableCell>{record.target.name}</TableCell>
                          <TableCell>{record.timestamp.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

