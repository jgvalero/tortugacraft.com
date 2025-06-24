document.addEventListener("DOMContentLoaded", function() {
  const select = document.getElementById("select-stat");
  drawLineChart(select.value);
  
  select.addEventListener("change", (event) => {
    drawLineChart(event.target.value);
  });
});

function drawLineChart(stat) {
  d3.select("#line-chart-div").selectAll("*").remove();

  const containerDiv = d3.select("#line-chart-div");
  const containerWidth = +containerDiv.style("width").replace("px", "");
  const containerHeight = containerWidth * 0.5625;

  // Set dimensions and margins
  const margin = { top: 10, right: 30, bottom: 30, left: 60 },
    width = containerWidth - margin.left - margin.right,
    height = containerHeight - margin.top - margin.bottom;

  // Create SVG
  const svg = d3
    .select("#line-chart-div")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Load data
  Promise.all([d3.json("data/week-01.json")]).then(function(files) {
    let allData = [];
    files.forEach((weekData, weekIndex) => {
      weekData.forEach((player) => {
        allData.push({
          username: player.username,
          week: weekIndex + 1,
          total_deaths: player.total_deaths,
          total_playtime: player.total_playtime,
          damage_dealt: player.damage_dealt,
          damage_taken: player.damage_taken,
        });
      });
    });

    // Group data by username
    const sumstat = d3.group(allData, (d) => d.username);

    // Add X axis (weeks)
    const x = d3.scaleLinear().domain([1, files.length]).range([0, width]);
    svg
      .append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(
        d3
          .axisBottom(x)
          .tickValues(d3.range(1, files.length + 1))
          .tickFormat((d) => `Week ${d}`),
      );

    // Add Y axis (selected stat)
    const maxValue = d3.max(allData, function(d) {
      return d[stat];
    });
    const y = d3.scaleLinear().domain([0, maxValue]).range([height, 0]);
    const tickValues = d3.range(
      0,
      maxValue + 1,
      Math.max(1, Math.ceil(maxValue / 10)),
    );
    svg
      .append("g")
      .call(d3.axisLeft(y).tickValues(tickValues).tickFormat(d3.format("d")));

    // Color palette
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Draw lines
    svg
      .selectAll(".line")
      .data(sumstat)
      .join("path")
      .attr("fill", "none")
      .attr("stroke", function(d) {
        return color(d[0]);
      })
      .attr("stroke-width", 1.5)
      .attr("d", function(d) {
        return d3
          .line()
          .x(function(d) {
            return x(d.week);
          })
          .y(function(d) {
            return y(d[stat]);
          })(d[1]);
      });

    // Add circles
    const jitterAmount = 8;
    const weekGroups = d3.group(allData, (d) => d.week);

    svg
      .selectAll(".dot")
      .data(allData)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", function(d) {
        const weekData = weekGroups.get(d.week);
        const sameValuePoints = weekData.filter((p) => p[stat] === d[stat]);
        if (sameValuePoints.length > 1) {
          const index = sameValuePoints.findIndex(
            (p) => p.username === d.username,
          );
          const offset =
            (index - (sameValuePoints.length - 1) / 2) * jitterAmount;
          return x(d.week) + offset;
        }
        return x(d.week);
      })
      .attr("cy", function(d) {
        return y(d[stat]);
      })
      .attr("r", 6)
      .style("fill", function(d) {
        return color(d.username);
      })
      .style("stroke", "white")
      .style("stroke-width", 2);

    // Add legend
    const legend = svg
      .selectAll(".legend")
      .data(color.domain().slice(0, sumstat.size))
      .enter()
      .append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) {
        return "translate(0," + i * 20 + ")";
      });

    legend
      .append("rect")
      .attr("x", width - 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", color);

    legend
      .append("text")
      .attr("x", width - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d, i) {
        return Array.from(sumstat.keys())[i];
      });
  });
}
