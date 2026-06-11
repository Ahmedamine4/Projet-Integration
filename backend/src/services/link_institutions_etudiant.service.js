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

        // B. Ajouter ou mettre à jour les institutions dans ValideEtudiant
        // On utilise upsert pour éviter les erreurs de doublons si l'étudiant 
        // renvoie la requête pour une institution qu'il a déjà.
        const upsertPromises = validesEtudiantsData.map((data) =>
            tx.valideEtudiant.upsert({
                where: {
                    utilisateur_id_institution_id: {
                        utilisateur_id: data.utilisateur_id,
                        institution_id: data.institution_id
                    }
                },
                update: {
                    date_debut: data.date_debut,
                    date_fin: data.date_fin,
                    niveau: data.niveau,
                    statut: data.statut
                },
                create: {
                    utilisateur_id: data.utilisateur_id,
                    institution_id: data.institution_id,
                    date_debut: data.date_debut,
                    date_fin: data.date_fin,
                    niveau: data.niveau,
                    statut: data.statut
                }
            })
        );

        return await Promise.all(upsertPromises);
    });

    return resultats;
};