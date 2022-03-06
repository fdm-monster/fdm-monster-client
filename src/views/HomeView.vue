<template>
  <RouterLink to="/settings">Settings</RouterLink>
  <hello-world />
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import HelloWorld from '../components/HelloWorld.vue';

export default defineComponent({
  name: 'HomeView',

  components: {
    HelloWorld,
  },
});
</script>
