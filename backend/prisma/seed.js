import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du remplissage massif de la base de données...');

  // =========================================================================
  // 0. SÉCURITÉ ANTI-DOUBLONS (P2002)
  // =========================================================================
  // Si le directeur existe déjà, c'est que le seed a déjà été exécuté.
  // On arrête proprement le script pour éviter de faire planter Docker.
  const seedDejaApplique = await prisma.utilisateur.findUnique({
    where: { email: 'directeur@ensat.ac.ma' }
  });

  if (seedDejaApplique) {
    console.log('✅ Le seed a déjà été appliqué ! Les données sont intactes. (Script ignoré)');
    return;
  }

  const hash = await bcrypt.hash('password123', 10);

  // =========================================================================
  // 1. INSTITUTION & DIRECTEUR
  // =========================================================================
  const institution = await prisma.institution.create({
    data: {
      nom: 'ENSA Tanger',
      addresse: 'Ziaten, Tanger',
      email: 'contact@ensat.ac.ma',
      academique: true,
    }
  });
  console.log(`✅ Institution créée : ${institution.nom}`);

  const userDirecteur = await prisma.utilisateur.create({
    data: {
      nom: 'Directeur',
      prenom: 'Général',
      email: 'directeur@ensat.ac.ma',
      mot_de_passe: hash,
      role: 'directeur',
      directeur: {
        create: {
          poste: 'Directeur ENSA',
          bureau: 'Direction 101',
          institution_id: institution.institution_id
        }
      }
    }
  });
  console.log(`✅ Directeur créé : ${userDirecteur.email}`);

  // =========================================================================
  // 2. PROFESSEURS
  // =========================================================================
  const prof1 = await prisma.utilisateur.create({
    data: {
      nom: 'Benali', prenom: 'Samira', email: 's.benali@ensat.ac.ma', mot_de_passe: hash, role: 'professeur',
      professeur: {
        create: {
          departement: 'Génie Informatique', specialite: 'Développement Backend',
          institutions: { connect: { institution_id: institution.institution_id } }
        }
      }
    }
  });

  const prof2 = await prisma.utilisateur.create({
    data: {
      nom: 'Cherkaoui', prenom: 'Youssef', email: 'y.cherkaoui@ensat.ac.ma', mot_de_passe: hash, role: 'professeur',
      professeur: {
        create: {
          departement: 'Génie Informatique', specialite: 'Cybersécurité',
          institutions: { connect: { institution_id: institution.institution_id } }
        }
      }
    }
  });
  console.log(`✅ 2 Professeurs créés.`);

  // =========================================================================
  // 3. L'ÉTUDIANT PRINCIPAL (Pour tester en profondeur)
  // =========================================================================
  const userYahya = await prisma.utilisateur.create({
    data: {
      nom: 'Yahya', prenom: 'Dev', email: 'yahya@student.ensat.ac.ma', mot_de_passe: hash, role: 'etudiant',
      etudiant: {
        create: {
          etudie: true, niveau: 'Cycle Ingénieur', promotion: '2026',
          institutions: {
            create: {
              institution_id: institution.institution_id,
              statut: 'valide', date_debut: new Date('2024-09-01')
            }
          }
        }
      }
    }
  });
  console.log(`✅ Étudiant principal créé : ${userYahya.email}`);

  // ---> Expériences pour l'étudiant principal
  // Projet Node.js/Prisma (Validé par Prof 1)
  await prisma.experience.create({
    data: {
      titre: 'API de Gestion de Portfolio', type: 'projet', utilisateur_id: userYahya.utilisateur_id,
      projet: {
        create: {
          lien_github: 'https://github.com/yahya/portfolio-api',
          resultat_obtenu: 'Architecture backend avec Express, PostgreSQL et Prisma.',
          validation: { create: { utilisateur_id: prof1.utilisateur_id, statut: 'valide', commentaire: 'Excellent travail sur le MCD.' } }
        }
      }
    }
  });

  // Projet Cybersécurité (En attente par Prof 2)
  await prisma.experience.create({
    data: {
      titre: 'SEED Labs : Vulnérabilité XSS', type: 'projet', utilisateur_id: userYahya.utilisateur_id,
      projet: {
        create: {
          resultat_obtenu: 'Exploitation et correction de failles XSS, modification de scripts de profil.',
          validation: { create: { utilisateur_id: prof2.utilisateur_id, statut: 'en_attente' } }
        }
      }
    }
  });

  // Stage d'été (Refusé - nécessite correction)
  await prisma.experience.create({
    data: {
      titre: 'Stage d\'été 2026 - Backend', type: 'stage', utilisateur_id: userYahya.utilisateur_id,
      stage: {
        create: {
          duree: '2 mois', missions_realisees: 'Dockerisation de l\'environnement de développement.',
          validation: { create: { utilisateur_id: prof1.utilisateur_id, statut: 'refuse', commentaire: 'Il manque le rapport de stage détaillé.' } }
        }
      }
    }
  });

  // =========================================================================
  // 4. GÉNÉRATION MASSIVE D'ÉTUDIANTS (Pour tester la Pagination)
  // =========================================================================
  console.log(`⏳ Génération de 15 étudiants supplémentaires...`);
  for (let i = 1; i <= 15; i++) {
    // Les 5 premiers seront "en_attente" d'inscription, les autres "valide"
    const statutInscription = i <= 5 ? 'en_attente' : 'valide';
    
    await prisma.utilisateur.create({
      data: {
        nom: `Nom${i}`, prenom: `Etudiant${i}`, email: `etudiant${i}@student.ensat.ac.ma`, mot_de_passe: hash, role: 'etudiant',
        etudiant: {
          create: {
            etudie: true, niveau: 'Cycle Ingénieur',
            institutions: {
              create: {
                institution_id: institution.institution_id,
                statut: statutInscription, date_debut: new Date('2024-09-01')
              }
            }
          }
        }
      }
    });
  }
  console.log(`✅ 15 étudiants générés (10 validés, 5 en attente).`);

  // =========================================================================
  // 5. DEMANDES DIVERSES
  // =========================================================================
  // Une demande de lettre de recommandation pour Yahya auprès du prof 1
  await prisma.lettresDeRecommendations.create({
    data: {
      utilisateur_id: userYahya.utilisateur_id, prof_utilisateur_id: prof1.utilisateur_id,
      objet: 'Recherche de stage PFE', description: 'Pour postuler aux offres de stage backend.', statut: 'en_attente'
    }
  });

  // Une activité en attente pour le dashboard du directeur
  await prisma.experience.create({
    data: {
      titre: 'Organisation Hackathon', type: 'activite', utilisateur_id: userYahya.utilisateur_id,
      activite: {
        create: {
          type: 'Événement', lieu: 'ENSA Tanger',
          validation: { create: { institution_id: institution.institution_id, statut: 'en_attente' } }
        }
      }
    }
  });

  // =========================================================================
  // 6. SCÉNARIOS DE TESTS AVANCÉS (Verrous & Visibilité ajoutés ici)
  // =========================================================================
  console.log('📦 Ajout des scénarios pour tester les verrous et la visibilité...');

  // Projet Personnel (Libre de modification et suppression)
  await prisma.experience.create({
    data: {
      titre: 'Projet Personnel - Application Météo', type: 'projet', type_specifique: 'personnel', utilisateur_id: userYahya.utilisateur_id, visibilite: false,
      projet: { create: { lien_github: 'https://github.com/yahya/meteo' } }
    }
  });

  // Stage Personnel (Libre de modification et suppression)
  await prisma.experience.create({
    data: {
      titre: 'Stage d\'observation (Personnel)', type: 'stage', type_specifique: 'personnel', utilisateur_id: userYahya.utilisateur_id, date_experience: new Date('2023-07-01'),
      stage: { create: { date_fin: new Date('2023-08-01'), duree: '30' } }
    }
  });

  // Projet Académique Refusé (Modification bloquée, Visibilité autorisée)
  await prisma.experience.create({
    data: {
      titre: 'Projet Académique - Application Mobile (Refusé)', type: 'projet', type_specifique: 'academique', utilisateur_id: userYahya.utilisateur_id,
      projet: {
        create: {
          validation: { create: { utilisateur_id: prof1.utilisateur_id, statut: 'refuse', commentaire: 'Technologie non autorisée.' } }
        }
      }
    }
  });

  // Stage Académique Validé (Modification et suppression bloquées)
  await prisma.experience.create({
    data: {
      titre: 'Stage PFE - Développeur Fullstack (Validé)', type: 'stage', type_specifique: 'academique', utilisateur_id: userYahya.utilisateur_id, date_experience: new Date('2025-02-01'),
      stage: {
        create: {
          date_fin: new Date('2025-08-01'), duree: '180',
          validation: { create: { utilisateur_id: prof2.utilisateur_id, statut: 'valide', commentaire: 'Excellent stage, soutenance validée.' } }
        }
      }
    }
  });

  // =========================================================================
  // 7. DONNÉES SPÉCIFIQUES POUR TESTER LE PORTFOLIO DE YAHYA
  // =========================================================================
  console.log('📦 Ajout des données pour le test du Portfolio...');

  // 7.1 Mettre à jour le profil pour booster le "score de complétion"
  await prisma.utilisateur.update({
    where: { utilisateur_id: userYahya.utilisateur_id },
    data: {
      a_propos: "Étudiant en cycle ingénieur, passionné par le développement backend (Node.js/Prisma) et la cybersécurité.",
      telephone: "+212600000000",
      github: "https://github.com/yahya",
      linkedin: "https://linkedin.com/in/yahya",
      photo: "https://via.placeholder.com/150",
    }
  });

  // 7.2 Créer l'entité Portfolio
  await prisma.portfolio.create({
    data: {
      titre: "Portfolio d'Ingénieur Backend",
      objectif_cible: "Recherche de stage d'été 2026",
      visibilite: true,
      utilisateur_id: userYahya.utilisateur_id,
    }
  });

  // 7.3 Créer des Compétences (Technologies et Domaines)
  const techNode = await prisma.competence.create({ data: { type: 'technologie', nom: 'Node.js' } });
  const techPrisma = await prisma.competence.create({ data: { type: 'technologie', nom: 'Prisma' } });
  const domaineWeb = await prisma.competence.create({ data: { type: 'domaine', nom: 'Développement Web' } });

  // 7.4 Associer les compétences au projet existant ("API de Gestion de Portfolio")
  const projetApi = await prisma.experience.findFirst({
    where: { utilisateur_id: userYahya.utilisateur_id, titre: 'API de Gestion de Portfolio' }
  });
  
  if (projetApi) {
    await prisma.competenceDeveloppee.createMany({
      data: [
        { experience_id: projetApi.experience_id, competence_id: techNode.competence_id },
        { experience_id: projetApi.experience_id, competence_id: techPrisma.competence_id },
        { experience_id: projetApi.experience_id, competence_id: domaineWeb.competence_id }
      ]
    });
    await prisma.experience.update({
      where: { experience_id: projetApi.experience_id },
      data: { visibilite: true }
    });
  }

  // 7.5 Ajouter une Certification (Visible par défaut)
  const expCertif = await prisma.experience.create({
    data: {
      titre: "AWS Certified Backend Developer",
      type: 'certification',
      visibilite: true,
      utilisateur_id: userYahya.utilisateur_id,
      date_experience: new Date('2025-01-10'),
    }
  });
  await prisma.certification.create({
    data: {
      experience_id: expCertif.experience_id,
      lien_URL: "https://aws.amazon.com/certification/",
      code: "AWS-DEV-123"
    }
  });
  
  // 7.6 Ajouter un Club et un Badge à Yahya
  const clubInfo = await prisma.club.create({
    data: { nom: "Club IT ENSAT", description: "Club d'informatique" }
  });
  const badgeTop = await prisma.badge.create({
    data: { nom: "Top Contributeur", score: 50 }
  });

  await prisma.etudiant.update({
    where: { etudiant_utilisateur_id: userYahya.utilisateur_id },
    data: {
      clubs: { connect: { club_id: clubInfo.club_id } },
      badges: { connect: { badge_id: badgeTop.badge_id } }
    }
  });

  console.log('--------------------------------------------------');
  console.log('🎉 BASE DE DONNÉES REMPLIE AVEC SUCCÈS !');
  console.log('👥 Comptes disponibles pour tester :');
  console.log('   👨‍💼 Directeur : directeur@ensat.ac.ma');
  console.log('   👨‍🏫 Prof 1    : s.benali@ensat.ac.ma (A des validations en attente)');
  console.log('   👨‍🏫 Prof 2    : y.cherkaoui@ensat.ac.ma (A le projet XSS en attente)');
  console.log('   🎓 Étudiant  : yahya@student.ensat.ac.ma');
  console.log('   🔑 Mdp pour tous : password123');
  console.log('--------------------------------------------------');
}

main()
  .catch((e) => {
    console.error("Erreur lors du seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });