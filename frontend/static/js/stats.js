document.addEventListener('DOMContentLoaded', function () {
    const chartTypeDropdown = document.getElementById('chart-type');
    const timeRangeDropdown = document.getElementById('time-range');
    const chartStyleDropdown = document.getElementById('chart-style');
    const sortOrderDropdown = document.getElementById('sort-order');
    const chartCanvas = document.getElementById('statistics-chart').getContext('2d');
    let chartInstance;

    // Dohvati podatke sa servera
    async function fetchChartData(chartType, timeRange) {
        const response = await fetch(`/get_chart_data?chart_type=${chartType}&time_range=${timeRange}`);
        return response.json();
    }

    // Sortiraj podatke
    function sortData(labels, data, order) {
        const sorted = labels.map((label, i) => ({ label, data: data[i] }))
            .sort((a, b) => order === 'high_to_low' ? b.data - a.data : a.data - b.data);

        return {
            sortedLabels: sorted.map(item => item.label),
            sortedData: sorted.map(item => item.data)
        };
    }

    // Iscrtaj grafikon
    async function renderChart() {
        const chartType = chartTypeDropdown.value;
        const timeRange = timeRangeDropdown.value;
        const chartStyle = chartStyleDropdown.value;
        const sortOrder = sortOrderDropdown.value;

        const chartData = await fetchChartData(chartType, timeRange);
        let labels = chartData.labels;
        let data = chartData.data;

        // Sortiraj podatke
        const { sortedLabels, sortedData } = sortData(labels, data, sortOrder);
        labels = sortedLabels;
        data = sortedData;

        // Konfiguracija chart.js objekta
        const chartConfig = {
            type: chartStyle,
            data: {
                labels: labels,
                datasets: [{
                    label: chartTypeDropdown.options[chartTypeDropdown.selectedIndex].text,
                    data: data,
                    backgroundColor: ['rgb(218, 165, 32, 0.75)','rgb(238, 220, 130, 0.75)',
                                      'rgb(254, 220, 86, 0.75)', 'rgb(210, 181, 91, 0.75)', 'rgb(252, 244, 163, 0.75)',
                                      'rgb(204, 119, 34, 0.75)', 'rgb(239, 253, 95, 0.75)','rgb(255, 221, 175, 0.75)',
                                      'rgb(253, 165, 15, 0.75)', 'rgb(195, 176, 145, 0.75)', 'rgb(252, 226, 5, 0.75)',
                                      'rgb(255, 191, 0, 0.75)', 'rgb(248, 228, 115, 0.75)'].sort(() => Math.random() - 0.5),
                    borderColor: 'rgba(204, 119, 34)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                indexAxis: chartStyleDropdown.options.selectedIndex == 1 ? 'y' : 'x',
                scales: {
                    y: chartStyleDropdown.options.selectedIndex < 3 ?
                    { beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                if (chartStyleDropdown.options.selectedIndex == 1) return this.getLabelForValue(value);
                                else if (chartTypeDropdown.options.selectedIndex == 2) return value;
                                else return '€' + value; // Add € symbol to y-axis ticks
                            },
                        }
                    } : {display: false},
                    x: chartStyleDropdown.options.selectedIndex < 3 ?
                    {
                        ticks:{
                            callback: function(value) {
                                if (chartStyleDropdown.options.selectedIndex == 1
                                    && chartTypeDropdown.options.selectedIndex < 2) return '€' + value;
                                else return this.getLabelForValue(value)
                            }
                        }
                    } : {display: false},
                },
                plugins: {
                    legend: chartStyleDropdown.options.selectedIndex < 3 ? {display: false} : {position: 'bottom'},
                    tooltip: {
                        callbacks: {
                            label: function(tooltipItem) {
                                if (chartTypeDropdown.options.selectedIndex == 2) return tooltipItem.raw;
                                else return '€' + tooltipItem.raw; // Add € symbol to tooltips
                            }
                        }
                    }
                }
            }
        };

        // Uništi instancu grafikona (ako već postoji)
        if (chartInstance) {
            chartInstance.destroy();
        }

        // Stvori novu instancu grafikona
        chartInstance = new Chart(chartCanvas, chartConfig);
    }

    // Dodaj funkcionalnost dropdown menijima
    chartTypeDropdown.addEventListener('change', renderChart);
    timeRangeDropdown.addEventListener('change', renderChart);
    chartStyleDropdown.addEventListener('change', renderChart);
    sortOrderDropdown.addEventListener('change', renderChart);

    // Inicijaliziraj iscrtavanje grafikona
    renderChart();
});