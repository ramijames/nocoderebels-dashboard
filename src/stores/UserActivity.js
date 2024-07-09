async function fetchUserActivity(startDate) {
  // Function to generate dates
  function generateDates(start, count) {
    const dates = [];
    let currentDate = new Date(start);
    for (let i = 0; i < count; i++) {
      dates.push(currentDate.toISOString().split('T')[0]); // Format YYYY-MM-DD
      currentDate.setDate(currentDate.getDate() - 1); // Move to the previous day
    }
    return dates;
  }

  try {
    // Generate 9 dates starting from startDate
    const dates = generateDates(startDate, 9);

    const response = await axios.get('https://xsrr-l2ye-dpbj.f2.xano.io/#/receive_week/get_receive_week', {
      params: {
        start_date: dates[0], // Assuming the API expects the most recent date
        // You might need to adjust this part based on how your API expects to receive the dates
      }
    });

    userActivityData.value = response.data;
  } catch (error) {
    console.error('Error fetching user activity data:', error);
    userActivityData.value = null;
  }
}