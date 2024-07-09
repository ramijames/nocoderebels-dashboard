<template>
  <main id="Dashboard">
    <!-- <pre>{{ orbits }}</pre> -->
    <ul v-if="orbits.length" class="orbits">
      <li v-for="(orbit, index) in orbits"
          :key="index" 
          class="single-orbit" 
          :style="orbitStyle(index)"
          >
        <div class="date">{{ orbit.orbit_date }}</div>
        <div v-for="(user, userIndex) in orbit.orbit_users" :ref="`user-${user.id}`" :key="userIndex" class="user" :style="calculateUserPositionForVisibleSegment(userIndex, index, 80)">
          <img :src="user.img" :alt="user.name" class="user-avatar">
        </div>
      </li>

    </ul>
    <!-- <ul v-if="orbits.length" class="orbits">
      <li v-for="(orbits, index) in orbits"
          :key="index" 
          class="single-orbit" 
          :style="orbitStyle(index)"
          >
        <div class="date">Today</div>
      </li>
    </ul> -->
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
import { ref } from 'vue';

export default {
  name: 'Dashboard',
  data() {
    return {
      dates: [],
      orbits: [],
      baseSize: 80,
      scrollPosition: 0, // Necessary for the strokes to be set to 0 initially
      items: []
    }
  },
  setup() {

  },
  methods: {
    async fetchAllOrbitsUserActivity(startDate, endDate) {

      try {
        const response = await axios.get('https://xsrr-l2ye-dpbj.f2.xano.io/api:oUvfVMO5/receive_week', {
          params: {
            start_date: startDate,
            end_date: endDate
          }
        });

        this.dates = response.data;

        // I hated how the data was structured, so I reorganized 
        // it into something that was easier to work with
        this.orbits = this.reorganizeData(this.dates);

        for (let i = 0; i < this.orbits.length; i++) {
          const users = this.orbits[i].orbit_users;
          const userStyles = this.positionUsersOnOrbit(i, users);
        }

      } catch (error) {
        console.error('Error fetching user activity:', error);
      }
    },
    reorganizeData(originalData) {
      const reorganizedData = [];

      originalData.forEach((item, index) => {
        const newItem = {
          orbit_id: index,
          orbit_date: item.contact_date,
          orbit_users: item.array.map(user => ({
            name: user.name,
            id: user.id,
            img: user.img,
            // TODO: Add more user data here
          }))
        };

        reorganizedData.push(newItem);
      });

      return reorganizedData;
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
        height: `${size}vw`, // This uses vw units to keep the orbits circular
        opacity: opacity,
      };
    },
    async updateUserPosition(id, position) {
      await this.$nextTick(); // Wait for the DOM to update because otherwise the ref isn't available yet
      const refKey = `user-${id}`;
      if (this.$refs[refKey] && this.$refs[refKey].length > 0) {
        const userElement = this.$refs[refKey][0]; // Access the first element of the array
        console.log(userElement, position);
        // Apply the position using CSS transform
        userElement.style.transform = `translate(${position.x}px, ${position.y}px)`;
      } else {
        console.error(`Ref ${refKey} not found.`);
      }
    },
    positionUsersOnOrbit(orbitIndex, users) {
      // 1. Limit to 5 users
      const visibleUsers = users.slice(0, 5);

      // Assuming the visible arc segment is the top half of the circle
      const startAngle = Math.PI / 2; // Start at 90 degrees (top of the circle)
      const endAngle = 3 * Math.PI / 2; // End at 270 degrees (also top, completing the half circle)
      const angleIncrement = (endAngle - startAngle) / (visibleUsers.length - 1 || 1); // Divide the arc into equal parts for the users

      visibleUsers.forEach((user, index) => {
        // 2 & 3. Adjust calculateUserPosition to position users within the visible arc segment
        const angle = startAngle + (angleIncrement * index); // Calculate angle within the visible segment
        const position = this.calculateUserPositionForVisibleSegment(user, orbitIndex, angle); // New method to calculate position

        this.updateUserPosition(user.id, position);
      });
    },
    calculateUserPositionForVisibleSegment(userIndex, orbitIndex, angle) {
      const orbitBaseSize = this.baseSize + (5 * 10); // Adjusted for up to 5 users
      const radius = orbitBaseSize / 2; // Calculate radius based on adjusted base size
      const left = radius * Math.cos(angle) + radius; // Adjust left position based on the radius and angle within the visible segment
      const top = radius * Math.sin(angle) + radius; // Adjust top position based on the radius and angle within the visible segment

      return {
        position: 'absolute',
        left: `${left}px`,
        top: `${top}px`,
        transform: 'translate(-50%, -50%)' // Center the images
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
    this.fetchAllOrbitsUserActivity('2024-01-01', '2024-01-08');

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

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 100%;
}

.scroll {
  height: 200vh;
}

span {
  color: white;
}

</style>