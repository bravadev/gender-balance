const API_KEY = "VOTRE_CLE_API"; // Remplacer "VOTRE_CLE_API" par votre propre clé d'API
const POPULATION_API_URL = "https://api.data.unicef.org/v2/population/countries/all/indicators/SP.POP.TOTL?api_key=" + API_KEY;
const GIRLS_POPULATION_API_URL = "https://api.data.unicef.org/v2/population/countries/all/indicators/SP.POP.GIRLS.IN?api_key=" + API_KEY;
const BOYS_POPULATION_API_URL = "https://api.data.unicef.org/v2/population/countries/all/indicators/SP.POP.BOYS.IN?api_key=" + API_KEY;

let chart = null;

// Fonction pour récupérer les données sur l'équilibre filles/garçons dans le monde
const getData = async () => {
// Récupération des données sur la population totale de chaque pays
    const populationData = await fetch(POPULATION_API_URL)
        .then((response) => response.json())
        .then((data) => data.data)
        .catch((error) => {
            console.error("Erreur lors de la récupération des données sur la population totale : ", error);
        });

// Récupération des données sur la population des filles de chaque pays
    const girlsPopulationData = await fetch(GIRLS_POPULATION_API_URL)
        .then((response) => response.json())
        .then((data) => data.data)
        .catch((error) => {
            console.error("Erreur lors de la récupération des données sur la population des filles : ", error);
        });

// Récupération des données sur la population des garçons de chaque pays
    const boysPopulationData = await fetch(BOYS_POPULATION_API_URL)
        .then((response) => response.json())
.then((data) => data.data)
        .catch((error) => {
            console.error("Erreur lors de la récupération des données sur la population des garçons : ", error);
        });

// Calcul du nombre total de filles et de garçons dans le monde
    let totalGirls = 0;
    let totalBoys = 0;
    populationData.forEach((country) => {
        totalGirls += country.value * 0.5; // Hypothèse que la population est composée de 50% de filles et de 50% de garçons
        totalBoys += country.value * 0.5;
    });

// Calcul de la différence de population entre les filles et les garçons pour chaque pays
    const countryData = [];
    populationData.forEach((populationCountry) => {
        girlsPopulationData.forEach((girlsCountry) => {
            boysPopulationData.forEach((boysCountry) => {
                if (populationCountry.country_code === girlsCountry.country_code && populationCountry.country_code === boysCountry.country_code) {
                    const girls = girlsCountry.value;
                    const boys = boysCountry.value;
                    const diff = girls - boys;
                    countryData.push({
                        country: populationCountry.country_name,
                        girls: girls,
                        boys: boys,
                        diff: diff
                    });
                }
            });
        });
    });

    return {
        totalGirls: totalGirls,
        totalBoys: totalBoys,
        countryData: countryData
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
                    data: [data.totalGirls, data.totalBoys],
                    backgroundColor: ["#f67280", "#c06c84"]
                }]
            },
            options: {
                legend: {
                    display: false
                }
            }
        });

        // Mise à jour du type de chart seulement si la chart est créée correctement
        if (chart !== null) {
            updateChartType();
        }
    }

// Affichage des données sur les différences de population entre les filles et les garçons pour chaque pays
    if (data.countryData.length > 0) {
        const countryTable = document.getElementById("country-data");

        // Entête du tableau HTML
        let countryTableHTML = "<thead><tr><th>Pays</th><th>Filles</th><th>Garçons</th><th>Différence</th></tr></thead><tbody>";

        // Lignes du tableau HTML
        data.countryData.forEach((country) => {
            countryTableHTML += "<tr><td>" + country.country + "</td><td>" + country.girls + "</td><td>" + country.boys + "</td><td>" + country.diff + "</td></tr>";
        });
        countryTableHTML += "</tbody>";

        countryTable.innerHTML = countryTableHTML;
    }

}

// Fonction pour mettre à jour les données de la chart
const updateChart = () => {
// Utiliser la méthode ".then()" pour gérer la promesse renvoyée par getData()
    getData().then((data) => {
        createChart(data);
        document.getElementById("last-update").innerHTML = new Date().toLocaleString();
    });
}

const updateChartType = () => {
    if (chart !== null) {
        const chartType = document.getElementById("chart-type").value;
        chart.config.type = chartType;
        chart.update();
    }
}

document.getElementById("refresh-btn").addEventListener("click", updateChart);
document.getElementById("chart-type").addEventListener("change", updateChartType);

setInterval(updateChart, 60000);
updateChart();
