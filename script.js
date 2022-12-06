const API_URL = "https://api.worldbank.org/v2/country/all/indicator/SP.POP.TOTL?format=json";

let chart = null;

const getData = async () => {
    const response = await fetch(API_URL);
    const data = await response.json();

// Récupération des données sur la population totale de chaque pays
    const populationData = data[1];

// Calcul du nombre total de filles et de garçons dans le monde
    let totalGirls = 0;
    let totalBoys = 0;
    populationData.forEach((country) => {
        totalGirls += country.value * 0.5; // Hypothèse que la population est composée de 50% de filles et de 50% de garçons
        totalBoys += country.value * 0.5;
    });

    return {
        girls: totalGirls,
        boys: totalBoys
    };

}

const createChart = (data) => {
    const chartElement = document.getElementById("chart");

// Vérifier si l'élément HTML de la chart existe et est de type canvas
    if (chartElement !== null && chartElement.nodeName === "CANVAS") {
        const ctx = chartElement.getContext("2d");
        chart = new Chart(ctx, {
            type: "bar",
            data: {
                labels: ["Filles", "Garçons"],
                datasets: [{
                    label: "Population",
                    data: [data.girls, data.boys],
                    backgroundColor: ["#f8b195", "#f67280"]
                }]
            },
            options: {
                legend: {
                    display: true,
                    position: "bottom"
                },
                legendCallback: function(chart) {
                    const legendHtml = [];
                    legendHtml.push('<ul class="' + chart.id + '-legend">');
                    for (var i = 0; i < chart.data.datasets.length; i++) {
                        legendHtml.push('<li><span style="background-color:' + chart.data.datasets[i].backgroundColor[0] + '"></span>Filles : ' + data.girls + '</li>');
                        legendHtml.push('<li><span style="background-color:' + chart.data.datasets[i].backgroundColor[1] + '"></span>Garçons : ' + data.boys + '</li>');
                    }
                    legendHtml.push('</ul>');
                    return legendHtml.join("");
                }
            }
        });

        // Mise à jour du type de chart seulement si la chart est créée correctement
        if (chart !== null) {
            updateChartType();
        }
    }

}

const updateChart = () => {
    getData().then((data) => {
        createChart(data);
        document.getElementById("last-update").innerHTML = new Date().toLocaleString();
    });
}

const updateChartType = () => {
    const chartType = document.getElementById("chart-type").value;
    chart.config.type = chartType;
    chart.update();
}

document.getElementById("refresh-btn").addEventListener("click", updateChart);
document.getElementById("chart-type").addEventListener("change", updateChartType);

setInterval(updateChart, 60000);
updateChart();
