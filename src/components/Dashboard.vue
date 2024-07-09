<template>
  <main id="Dashboard">
    <ul v-if="dates.length" class="orbits">
      <li v-for="(date, index) in dates" 
          :key="index" 
          class="single-orbit" 
          :style="orbitStyle(index)"
          >
          
        <div class="date">Today</div>
      </li>
    </ul>
    <!-- <ul v-if="dates.length">
      <li v-for="(date, index) in dates" :key="index">
        <div>{{ date.contact_date }}</div>
        <ul v-for="user in date.array" :key="index">
          <li>{{ user.name }}</li>
          <li>{{ user.id }}</li>
          <li><img :src="user.img" alt="User Image"></li>
          <li>{{ user.position }}</li>
          <li>{{ user.city }}</li>
          <li>{{ user._orbits_last_message.message_head }}</li>
          <li>{{ user._orbits_last_message.message }}</li>
        </ul>
      </li>
    </ul> -->
  </main>
  <div class="scroll"></div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'Dashboard',
  data() {
    return {
      dates: [],
      baseSize: 80,
      scrollPosition: 0, // Necessary for the strokes to be set to 0 initially
    }
  },
  setup() {
    
  },
  methods: {
    async fetchUserActivity(startDate, endDate) {
      try {
        const response = await axios.get('https://xsrr-l2ye-dpbj.f2.xano.io/api:oUvfVMO5/receive_week', {
          params: {
            start_date: startDate,
            end_date: endDate
          }
        });
        this.dates = response.data;
        console.log(this.dates);
      } catch (error) {
        console.error('Error fetching user activity:', error);
      }
    },
    orbitStyle(index) {
      const size = this.baseSize - (10 * index);
      const totalOrbits = 9;
      let opacity = 1;

      // For the last two orbits, make them transparent,
      // We will only show them when the user scrolls down
      if (index >= totalOrbits - 2) {
        const startOpacityScroll = 0; // Scroll position where opacity starts changing
        const fullOpacityScroll = 500; // Scroll position where orbits become fully opaque
        const scrollRange = fullOpacityScroll - startOpacityScroll;
        const opacityRange = Math.min(Math.max(this.scrollPosition - startOpacityScroll, 0), scrollRange) / scrollRange;
        opacity = opacityRange;
      }

      return {
        width: `${size}vw`,
        height: `${size}vw`,
        opacity: opacity,
      };
    },
    handleScroll() {
      // Increase baseSize as the user scrolls down
      this.baseSize = 80 + (window.scrollY / 10);
      
      // Scroll position is needed for orbitStyle method
      this.scrollPosition = window.scrollY;
    },
  },
  mounted() {
    // Fetch user activity for the first week of 2024
    this.fetchUserActivity('2024-01-01', '2024-01-08');

    // Scroll event listener
    window.scrollTo(0, 0);
    window.addEventListener('scroll', this.handleScroll);
  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.handleScroll);
  },
}

</script>

<style scoped lang="scss">

@import '@/assets/_variables.scss';

.scroll {
  height: 200vh;
}

#Dashboard {
  height: 100vh;
  position: relative;

  .orbit-cover {
    position: fixed;
    top: 100%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 20vw;
    height: 20vw;
    background: $white;
    border-radius: 100%;
    z-index: 1;
  }

  .orbits {
    list-style: none;
    padding: 0;
    margin: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    position: fixed;
    mask-image: radial-gradient(circle at 50% 50%, black 0 50%, transparent 80%);

    .single-orbit {
      border: 1px solid $white;
      border-radius: 100%;
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translate(-50%, -50%);

      .date {
        position: absolute;
        top: 0;
        left: 50%;
        transform: translate(-50%, -50%);
        background: $black;
        padding: $spacing-lg;
        color: rgba(white, .5);
        display: none;
      }

      &:first-child .date {
        display: block;
      }
    }
  }
}

</style>