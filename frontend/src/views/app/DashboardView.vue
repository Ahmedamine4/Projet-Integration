<script setup>
import { computed, ref } from 'vue';
import PortfolioCertification from '@/components/portfolio/PortfolioCertification.vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const authStore = useAuthStore();
const userID = authStore.user.utilisateur_id;
const routeID = route.params.id;
const certification = ref({
  id: 'cert-aws-solutions-architect-associate-2025',
  type: 'certificate',
  title: 'AWS Certified Solutions Architect - Associate',
  institution: 'Amazon Web Services',
  issueDate: '2025-04-18',
  description: 'Earned the AWS Certified Solutions Architect - Associate certification after completing training and assessment focused on designing secure, resilient, high-performing, and cost-optimized cloud architectures. Covered compute, storage, networking, IAM, monitoring, serverless services, databases, deployment patterns, and reliability best practices.',
  visibleToEveryone: true,
  credentialUrl: 'https://aws.amazon.com/certification/certified-solutions-architect-associate/',
  code: 'AWS-SAA-C03-2025-184',
  technologies: [
    'AWS',
    'EC2',
    'S3',
    'VPC',
    'IAM',
    'Lambda',
    'RDS',
    'CloudWatch',
  ],
  domains: [
    'DevOps and Cloud Infrastructure',
    'Cloud Architecture',
    'System Design',
    'Security',
  ],
});
</script>

<template>
  <div class="dashboard-view">
    <PortfolioCertification
      :certification
      :can-edit="userID === routeID" 
    />
  </div>
</template>

<style scoped>
.dashboard-view {
  width: min(40rem, 100%);
  margin-inline: auto;
  margin-top: 30vh;
}
</style>


