document.addEventListener("DOMContentLoaded", function() {
  console.log("Hello, World!");

  const containerDiv = d3.select("#line-chart-div");
  const containerWidth = +containerDiv.style("width").replace("px", "");
  const containerHeight = containerWidth * 0.5625;

  console.log(containerHeight);

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
});
