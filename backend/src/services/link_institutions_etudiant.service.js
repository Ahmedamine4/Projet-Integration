import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


export const LinkInstitutionsToEtudiantService = async (etudiantId, etudieInput, institutionsPayload) => {
    const today = new Date();
    let latestDateFin = new Date(0);

    // 1. Préparer les données et calculer les dates manquantes
    const validesEtudiantsData = institutionsPayload.map((inst) => {
        const dateDebut = new Date(inst.date_debut);
        let dateFin;

        // Si la date_fin est fournie, on l'utilise
        if (inst.date_fin) {
            dateFin = new Date(inst.date_fin);
        } else {
            // Sinon, on la calcule selon le niveau
            dateFin = new Date(dateDebut);
            const niveau = inst.niveau?.toLowerCase();
            let anneesAAjouter = 0;

            if (niveau === 'bachelor') anneesAAjouter = 3;
            else if (niveau === 'master') anneesAAjouter = 2;
            else if (niveau === 'doctorat') anneesAAjouter = 2;

            dateFin.setFullYear(dateFin.getFullYear() + anneesAAjouter);
        }

        // Mettre à jour la date de fin la plus lointaine pour la vérification globale
        if (dateFin > latestDateFin) {
            latestDateFin = dateFin;
        }

        return {
            utilisateur_id: etudiantId,
            institution_id: inst.institutionId,
            date_debut: dateDebut,
            date_fin: dateFin,
            niveau: inst.niveau,
            description: inst.description ?? null,
            statut: 'en_attente' // Statut défini dans ton Enum Prisma
        };
    });

    // 2. Déterminer le statut "etudie" final
    // On convertit le string "true"/"false" en vrai booléen
    let isEtudiantActif = String(etudieInput).toLowerCase() === 'true';

    // Règle : si la date d'aujourd'hui a dépassé la date de fin la plus lointaine, etudie passe à false
    if (today >= latestDateFin) {
        isEtudiantActif = false;
    }

    // 3. Exécuter toutes les requêtes dans une Transaction Prisma
    // Cela garantit que si une étape échoue, tout est annulé
    const resultats = await prisma.$transaction(async (tx) => {
        
        // A. Mettre à jour l'étudiant (champ etudie)
        await tx.etudiant.update({
            where: { etudiant_utilisateur_id: etudiantId },
            data: { etudie: isEtudiantActif }
        });

        // B. Ajouter les institutions dans ValideEtudiant
        // On crée un enregistrement pour chaque institution, même si le même
        // étudiant et la même institution apparaissent plusieurs fois.
        const createPromises = validesEtudiantsData.map((data) =>
            tx.valideEtudiant.create({
                data
            })
        );

        return await Promise.all(createPromises);
    });

    return resultats;
};

export const updateValidEtudiantDescriptionService = async (etudiantId, description) => {
  const record = await prisma.valideEtudiant.findFirst({
    where: {
      utilisateur_id: etudiantId,
    },
    orderBy: {
      date_debut: 'desc',
    },
    select: {
      valide_etudiant_id: true,
    },
  });

  if (!record) {
    throw new Error('Aucune demande trouvée pour cet étudiant.');
  }

  return prisma.valideEtudiant.update({
    where: {
      valide_etudiant_id: record.valide_etudiant_id,
    },
    data: {
      description,
    },
  });
};