# Terraform — infrastructure

Ce dossier contient la configuration Terraform pour déployer l'infrastructure AWS du projet (VPC, subnets, NAT, EC2, RDS PostgreSQL, ALB, target groups, S3, CloudFront, key pair, etc.). Le backend Terraform est configuré pour utiliser un bucket S3 (voir `backend.tf`).

Usage rapide

- Initialiser le backend :

```
terraform init
```
- Appliquer la configuration :

```
terraform apply
```

Remarques importantes

- L'apply déclenche un `local-exec` (provisioner) qui lance `../ansible/run-from-terraform.ps1` afin de déployer les containers via Ansible/SSH. Cela signifie que `terraform apply` peut exécuter du code localement et déclencher des actions externes.
- Les variables sensibles sont déclarées dans `variables.tf` et peuvent être transmises au provisioner via des variables d'environnement. Assurez-vous que ces secrets sont fournis de façon sûre (CI/CD, vault, AWS SSM/Secrets Manager) — ne les commitez jamais.

Fichiers clés

- `backend.tf` : configuration du backend S3 pour l'état Terraform.
- `variables.tf` : déclaration des variables (region, CIDR, DB credentials, secrets JWT, etc.).
- `networking.tf` : VPC, subnets, NAT, route tables.
- `security_groups.tf` : security groups pour ALB, instances, DB.
- `main.tf` : RDS, EC2 (2 instances), ALB, S3, CloudFront, key pair et le provisioner qui appelle Ansible.
- `outputs.tf` : outputs exposés (IPs, endpoints, domaines CloudFront, bucket S3).
- `keys/` : paire SSH (clé publique + clé privée) utilisée pour créer le keypair AWS.

Éléments **à supprimer / sécuriser** (priorité)

1. `keys/id_rsa` (clé privée) — présent dans le dépôt : NE DOIT PAS ÊTRE VERSIONNÉ. Supprimer immédiatement le fichier du dépôt, ajouter `keys/id_rsa` à `.gitignore`, et faire rotation/invalidaton de la clé côté AWS (supprimer le keypair et en recréer une nouvelle gérée hors du dépôt).

2. Variables secrètes passées par le provisioner : `db_password`, `jwt_secret`, `jwt_refresh_secret`, `supabase_service_role_key`, `github_client_secret`. Éviter de les exposer en clair dans l'environnement local. Utiliser un gestionnaire de secrets (AWS Secrets Manager, SSM Parameter Store, ou variables CI chiffrées).

3. Provisioner `local-exec` qui appelle `run-from-terraform.ps1` — pratique mais fragile et exécute du code local ; préférer une orchestration via pipeline CI/CD ou un `null_resource` déclenché depuis un runner sécurisé si vous devez automatiser l'exécution d'Ansible. Documenter bien cette dépendance si vous la conservez.

4. Dans `outputs.tf` il existe un bloc commenté (ASCII-art résumé) — inoffensif mais superflu. Vous pouvez le supprimer si vous voulez nettoyer le fichier.

Recommendations rapides

- Supprimer `keys/id_rsa` du repo et régénérer/rotater la clé.
- Mettre les secrets dans un vault ou variables d'environnement sécurisées côté CI, puis passer des références (et non les valeurs) à Terraform/Ansible.
- Documenter dans votre procédure de déploiement comment exécuter Ansible (localement, via Docker, ou par CI) au lieu d'utiliser implicitement le provisioner.

Si vous voulez, j'applique tout de suite la suppression du fichier privé `keys/id_rsa` du dépôt (création d'un commit qui l'enlève et ajout à `.gitignore`) — souhaitez-vous que je fasse cela maintenant ?

Résumé des fichiers Ansible (dans `infrastructure/ansible`)

- `run-from-terraform.sh` : script Bash qui vérifie la présence des commandes et variables, génère dynamiquement un inventaire Ansible à partir des variables d'environnement (IPs, clé SSH), attend la disponibilité SSH des instances puis exécute `ansible-playbook` avec les secrets/outputs fournis par Terraform.

- `run-from-terraform.ps1` : équivalent PowerShell plus riche — peut lancer Ansible localement, exécuter Ansible via une image Docker en fallback, ou déployer directement via SSH en uploadant un script de déploiement distant. C'est le script appelé par le provisioner Terraform `local-exec`.

- `known_hosts` : fichier `known_hosts` SSH avec les empreintes publiques des hôtes (utilisé par les connexions SSH/SCP/Ansible pour éviter les prompts interactifs).

- `inventory.ini` : exemple/inventaire Ansible statique listant `backend1` et `backend2` avec chemins de clé et variables communes. Le script `run-from-terraform` génère un inventaire similaire dynamiquement.

- `deploy.yml` : playbook Ansible qui installe Docker, récupère et (re)déploie les images backend et frontend, configure containers, effectue vérifications de santé et affiche un résumé. Il valide la présence des variables critiques (DB, secrets, domaines).

- `deploy.sh` : wrapper Bash minimal qui se place dans `terraform/` puis lance `terraform init` et `terraform apply` (convenience script).

- `.gitkeep` : placeholder vide.

Gardez à l'esprit

- Le playbook et les scripts supposent que des secrets et IPs valides sont fournis par Terraform; testez ces étapes dans un environnement contrôlé avant de les automatiser dans un pipeline.
- En production, évitez d'exécuter automatiquement Ansible depuis Terraform sur votre poste local : préférez un pipeline CI/CD ou un runner sécurisé.
