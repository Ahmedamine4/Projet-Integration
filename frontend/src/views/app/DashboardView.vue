<script setup>
import Activity from '@/components/portfolio/Activity.vue';

const activity = {
  id: 'cmpinjxs9000dpn3vy78amjjl',
  type: 'activity',
  title: 'Territory Development Challenge',
  date: '2024-06-12',
  description: 'Participated in the Territory Development Challenge, an international community innovation competition focused on proposing creative solutions for territorial development in the Tanger-Tetouan-Al Hoceima region.',
  visibleToEveryone: true,
  activityType: 'Competition',
  location: 'Tanger, Morocco',
  club: '',
  technologies: [
    'Digital Innovation',
    'Open Innovation',
  ],
  domains: [
    'Territorial Development',
    'Community Innovation',
    'Sustainable Development',
    'Entrepreneurship',
  ],
  imagePreview: 'https://xfnburehcqkcmebvpfqh.supabase.co/storage/v1/object/public/activites/1779559120094-maroc-Lancement-premier-concours-international-communautaire-innovation-Tanger-Tetouan-Al-Hoceima-696x385.png',
};

</script>

<template>
  <div>
    <Activity :activity />
  </div>
</template>

<style scoped>
div {
  display: flex;
  margin: auto;
  align-items: center;
  justify-content: center;
  margin-top: 14vh;
}
</style>
