import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export type Player = {
  id: string
  name: string
  code: string
  isAlive: boolean
  missionId: string | null
  targetId: string | null
}

export type Mission = {
  id: string
  title: string
  description: string
}

export type KillRequest = {
  id: string
  killerId: string
  targetId: string
  status: "pending" | "confirmed" | "rejected"
  timestamp: Date
}

export type PlayerWithTargetMission = Player & {
  targetMission?: Mission
}

export type KillRecord = {
  id: string
  killerId: string
  targetId: string
  timestamp: Date
}

export async function getPlayers(): Promise<Player[]> {
  return prisma.player.findMany()
}

export async function getPlayer(id: string): Promise<PlayerWithTargetMission | null> {
  const player = await prisma.player.findUnique({
    where: { id },
    include: {
      mission: true,
      target: {
        include: {
          mission: true,
        },
      },
    },
  })

  if (!player) return null

  return {
    ...player,
    targetMission: player.target?.mission || undefined,
  }
}

export async function getPlayerByCode(code: string): Promise<Player | null> {
  return prisma.player.findUnique({ where: { code } })
}

export async function addPlayer(name: string, code: string): Promise<Player> {
  return prisma.player.create({
    data: { name, code },
  })
}

export async function updatePlayer(updatedPlayer: Player): Promise<Player> {
  return prisma.player.update({
    where: { id: updatedPlayer.id },
    data: updatedPlayer,
  })
}

export async function deletePlayer(id: string): Promise<void> {
  await prisma.player.delete({ where: { id } })
}

export async function getMissions(): Promise<Mission[]> {
  return prisma.mission.findMany()
}

export async function getMission(id: string): Promise<Mission | null> {
  return prisma.mission.findUnique({ where: { id } })
}

export async function addMission(title: string, description: string): Promise<Mission> {
  return prisma.mission.create({
    data: { title, description },
  })
}

export async function updateMission(updatedMission: Mission): Promise<Mission> {
  return prisma.mission.update({
    where: { id: updatedMission.id },
    data: updatedMission,
  })
}

export async function deleteMission(id: string): Promise<void> {
  await prisma.mission.delete({ where: { id } })
}

export async function createKillRequest(killerId: string, targetId: string): Promise<KillRequest> {
  return prisma.killRequest.create({
    data: {
      killerId,
      targetId,
      status: "pending",
    },
  })
}

export async function getPendingKillRequest(targetId: string): Promise<KillRequest | null> {
  return prisma.killRequest.findFirst({
    where: {
      targetId,
      status: "pending",
    },
  })
}

export async function confirmKill(requestId: string): Promise<void> {
  const request = await prisma.killRequest.findUnique({ where: { id: requestId } })
  if (!request) return

  await prisma.$transaction(async (tx) => {
    await tx.killRequest.update({
      where: { id: requestId },
      data: { status: "confirmed" },
    })

    const killer = await tx.player.findUnique({ where: { id: request.killerId } })
    const target = await tx.player.findUnique({ where: { id: request.targetId } })

    if (!killer || !target) return

    await tx.player.update({
      where: { id: target.id },
      data: { isAlive: false },
    })

    await tx.player.update({
      where: { id: killer.id },
      data: { targetId: target.targetId },
    })

    await tx.killRecord.create({
      data: {
        killerId: killer.id,
        targetId: target.id,
      },
    })
  })
}

export async function rejectKill(requestId: string): Promise<void> {
  await prisma.killRequest.update({
    where: { id: requestId },
    data: { status: "rejected" },
  })
}

export async function resetGame(): Promise<void> {
  await prisma.$transaction([
    prisma.killRecord.deleteMany(),
    prisma.killRequest.deleteMany(),
    prisma.player.deleteMany(),
  ])
}

export async function assignMissionsAndTargets(): Promise<void> {
  const alivePlayers = await prisma.player.findMany({ where: { isAlive: true } })
  if (alivePlayers.length < 2) return

  const shuffled = [...alivePlayers].sort(() => 0.5 - Math.random())

  await prisma.$transaction(
    shuffled.map((player, index) => {
      const targetIndex = (index + 1) % shuffled.length
      return prisma.player.update({
        where: { id: player.id },
        data: { targetId: shuffled[targetIndex].id },
      })
    }),
  )
}

export async function assignMissionToPlayer(playerId: string, missionId: string): Promise<Player | null> {
  return prisma.player.update({
    where: { id: playerId },
    data: { missionId },
  })
}

export async function getKillCountByPlayer(): Promise<{ [playerId: string]: number }> {
  const killCounts = await prisma.killRecord.groupBy({
    by: ["killerId"],
    _count: {
      killerId: true,
    },
  })

  return killCounts.reduce(
    (acc, { killerId, _count }) => {
      acc[killerId] = _count.killerId
      return acc
    },
    {} as { [playerId: string]: number },
  )
}

export async function getPlayerWithMostKills(): Promise<Player | null> {
  const killCounts = await getKillCountByPlayer()
  if (Object.keys(killCounts).length === 0) {
    return null
  }
  const playerIdWithMostKills = Object.entries(killCounts).reduce((a, b) => (a[1] > b[1] ? a : b))[0]
  return prisma.player.findUnique({ where: { id: playerIdWithMostKills } })
}

export async function getKillHistory(): Promise<Array<{ killer: Player; target: Player; timestamp: Date }>> {
  const killRecords = await prisma.killRecord.findMany({
    include: {
      killer: true,
      target: true,
    },
    orderBy: {
      timestamp: "desc",
    },
  })

  return killRecords.map(({ killer, target, timestamp }) => ({
    killer,
    target,
    timestamp,
  }))
}

