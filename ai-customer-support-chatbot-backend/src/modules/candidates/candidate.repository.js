const prisma = require("../../config/prisma");

class CandidateRepository {
  async getProfileByUserId(userId) {
    if (!userId) return null;
    return prisma.candidateProfile.findUnique({
      where: { userId },
    });
  }

  async upsertProfile(userId, updateData) {
    if (!userId) return null;
    
    // Convert experience to integer if present
    if (updateData.experience !== undefined) {
      updateData.experience = parseInt(updateData.experience, 10);
      if (isNaN(updateData.experience)) delete updateData.experience;
    }

    return prisma.candidateProfile.upsert({
      where: { userId },
      update: updateData,
      create: {
        userId,
        ...updateData,
      },
    });
  }

  async getStats() {
    const totalCandidates = await prisma.candidateProfile.count();
    const completedProfiles = await prisma.candidateProfile.count({
      where: { profileCompletion: { gte: 80 } }
    });
    
    const profilesWithExperience = await prisma.candidateProfile.findMany({
      where: { experience: { not: null } },
      select: { experience: true }
    });

    let avgExperience = 0;
    if (profilesWithExperience.length > 0) {
      const sum = profilesWithExperience.reduce((acc, curr) => acc + curr.experience, 0);
      avgExperience = parseFloat((sum / profilesWithExperience.length).toFixed(1));
    }

    // Top preferred locations
    const topLocations = await prisma.candidateProfile.groupBy({
      by: ['preferredLocation'],
      _count: { _all: true },
      where: { preferredLocation: { not: null } },
      orderBy: { _count: { preferredLocation: 'desc' } },
      take: 5
    });

    return {
      totalCandidates,
      completedProfiles,
      averageExperience: avgExperience,
      topLocations: topLocations.map(l => ({ location: l.preferredLocation, count: l._count._all }))
    };
  }
}

module.exports = new CandidateRepository();
