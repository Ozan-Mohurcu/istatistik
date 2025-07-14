// Global Variables
let currentChart = null;
let currentData = null;

// DOM Elements
const generateBtn = document.getElementById('generateBtn');
const dataTypeSelect = document.getElementById('dataType');
const chartTypeSelect = document.getElementById('chartType');
const loadingElement = document.getElementById('loading');
const chartCanvas = document.getElementById('mainChart');
const statsContent = document.getElementById('statsContent');
const interpretationContent = document.getElementById('interpretation');
const dataTableContainer = document.getElementById('dataTable');
const chartTitle = document.getElementById('chartTitle');
const refreshBtn = document.getElementById('refreshBtn');
const downloadBtn = document.getElementById('downloadBtn');

// Visitor Counter
function initializeVisitorCounter() {
    let count = localStorage.getItem('visitorCount') || 0;
    count = parseInt(count) + 1;
    localStorage.setItem('visitorCount', count);
    document.getElementById('visitorCount').textContent = count;
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    initializeVisitorCounter();
    initializeApp();
});

generateBtn.addEventListener('click', generateData);
refreshBtn.addEventListener('click', generateData);
downloadBtn.addEventListener('click', downloadChart);

// Initialize Application
function initializeApp() {
    console.log('İstatistik Öğrenme Platformu başlatıldı');
    generateData();
}

// Main Data Generation Function
function generateData() {
    const dataType = dataTypeSelect.value;
    const chartType = chartTypeSelect.value;
    
    showLoading(true);
    chartTitle.textContent = getChartTitle(chartType, dataType);
    
    setTimeout(() => {
        try {
            currentData = createDataSet(dataType);
            createChart(chartType, currentData);
            updateStatistics(currentData, chartType);
            updateInterpretation(chartType, currentData);
            updateDataTable(currentData, dataType);
        } catch (error) {
            console.error('Veri oluşturma hatası:', error);
            showError('Veri oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            showLoading(false);
        }
    }, 800);
}

// Show/Hide Loading
function showLoading(show) {
    loadingElement.style.display = show ? 'block' : 'none';
}

// Show Error Message
function showError(message) {
    statsContent.innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            <p>${message}</p>
        </div>
    `;
}

// Get Chart Title
function getChartTitle(chartType, dataType) {
    const chartNames = {
        histogram: 'Histogram',
        boxplot: 'Box Plot (Kutu Grafiği)',
        scatter: 'Scatter Plot (Saçılım)',
        bar: 'Bar Chart (Çubuk)',
        pie: 'Pie Chart (Pasta)',
        line: 'Line Chart (Çizgi)'
    };
    
    const dataNames = {
        normal: 'Normal Dağılım',
        skewed: 'Çarpık Dağılım',
        uniform: 'Düzgün Dağılım',
        categorical: 'Kategorik Veri',
        bivariate: 'İki Değişkenli Veri'
    };
    
    return `${chartNames[chartType]} - ${dataNames[dataType]}`;
}

// Create Dataset
function createDataSet(type) {
    const size = 100;
    let data = [];
    
    switch(type) {
        case 'normal':
            for(let i = 0; i < size; i++) {
                data.push(normalRandom(50, 15));
            }
            break;
            
        case 'skewed':
            for(let i = 0; i < size; i++) {
                let val = normalRandom(30, 10);
                if(Math.random() > 0.8) val += 40;
                data.push(Math.max(0, val));
            }
            break;
            
        case 'uniform':
            for(let i = 0; i < size; i++) {
                data.push(Math.random() * 100);
            }
            break;
            
        case 'categorical':
            const categories = ['Kategori A', 'Kategori B', 'Kategori C', 'Kategori D', 'Kategori E'];
            const weights = [0.3, 0.25, 0.2, 0.15, 0.1];
            for(let i = 0; i < size; i++) {
                let rand = Math.random();
                let cumWeight = 0;
                for(let j = 0; j < categories.length; j++) {
                    cumWeight += weights[j];
                    if(rand <= cumWeight) {
                        data.push(categories[j]);
                        break;
                    }
                }
            }
            break;
            
        case 'bivariate':
            for(let i = 0; i < size; i++) {
                let x = normalRandom(50, 15);
                let y = x * 0.8 + normalRandom(10, 8);
                data.push({x: x, y: y});
            }
            break;
    }
    
    return {
        type: type,
        data: data,
        size: size
    };
}

// Normal Random Generator
function normalRandom(mean = 0, std = 1) {
    let u = 0, v = 0;
    while(u === 0) u = Math.random();
    while(v === 0) v = Math.random();
    return mean + std * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

// Create Chart
function createChart(type, dataset) {
    const ctx = chartCanvas.getContext('2d');
    
    if(currentChart) {
        currentChart.destroy();
    }
    
    let config = {};
    
    switch(type) {
        case 'histogram':
            config = createHistogramConfig(dataset);
            break;
        case 'boxplot':
            config = createBoxplotConfig(dataset);
            break;
        case 'scatter':
            config = createScatterConfig(dataset);
            break;
        case 'bar':
            config = createBarConfig(dataset);
            break;
        case 'pie':
            config = createPieConfig(dataset);
            break;
        case 'line':
            config = createLineConfig(dataset);
            break;
    }
    
    currentChart = new Chart(ctx, config);
}

// Histogram Configuration
function createHistogramConfig(dataset) {
    if(dataset.type === 'categorical') {
        return createBarConfig(dataset);
    }
    
    const values = dataset.data.filter(v => typeof v === 'number');
    const bins = 12;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binWidth = (max - min) / bins;
    
    let histogram = new Array(bins).fill(0);
    let labels = [];
    
    for(let i = 0; i < bins; i++) {
        const start = min + i * binWidth;
        const end = min + (i + 1) * binWidth;
        labels.push(`${start.toFixed(1)}-${end.toFixed(1)}`);
    }
    
    values.forEach(value => {
        let binIndex = Math.floor((value - min) / binWidth);
        if(binIndex >= bins) binIndex = bins - 1;
        if(binIndex < 0) binIndex = 0;
        histogram[binIndex]++;
    });
    
    return {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Frekans',
                data: histogram,
                backgroundColor: 'rgba(59, 130, 246, 0.7)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 2,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Histogram - Veri Dağılımı',
                    font: { size: 16, weight: 'bold' }
                },
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Frekans', font: { weight: 'bold' } }
                },
                x: {
                    title: { display: true, text: 'Değer Aralığı', font: { weight: 'bold' } }
                }
            }
        }
    };
}

// Boxplot Configuration (GERÇEK BOX PLOT)
function createBoxplotConfig(dataset) {
    if(dataset.type === 'categorical' || dataset.type === 'bivariate') {
        return createBarConfig(dataset);
    }
    
    const values = dataset.data.filter(v => typeof v === 'number');
    const sorted = [...values].sort((a, b) => a - b);
    const n = sorted.length;
    
    const q1 = sorted[Math.floor(n * 0.25)];
    const median = sorted[Math.floor(n * 0.5)];
    const q3 = sorted[Math.floor(n * 0.75)];
    const iqr = q3 - q1;
    const min = sorted[0];
    const max = sorted[n-1];
    
    const lowerWhisker = Math.max(min, q1 - 1.5 * iqr);
    const upperWhisker = Math.min(max, q3 + 1.5 * iqr);
    const outliers = values.filter(v => v < lowerWhisker || v > upperWhisker);
    
    // Gerçek box plot datasets
    const datasets = [];
    
    // 1. Alt whisker çizgisi (Q1'den aşağı)
    datasets.push({
        label: 'Alt Whisker',
        type: 'line',
        data: [
            { x: 1, y: lowerWhisker },
            { x: 1, y: q1 }
        ],
        borderColor: 'rgba(75, 85, 99, 1)',
        borderWidth: 3,
        pointRadius: 0,
        tension: 0
    });
    
    // 2. Ana kutu (Q1'den Q3'e)
    datasets.push({
        label: 'Ana Kutu',
        type: 'bar',
        data: [{ x: 1, y: q3 - q1 }],
        backgroundColor: 'rgba(59, 130, 246, 0.4)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        barThickness: 80,
        base: q1
    });
    
    // 3. Medyan çizgisi
    datasets.push({
        label: 'Medyan',
        type: 'line',
        data: [
            { x: 0.6, y: median },
            { x: 1.4, y: median }
        ],
        borderColor: 'rgba(220, 38, 127, 1)',
        borderWidth: 4,
        pointRadius: 0,
        tension: 0
    });
    
    // 4. Üst whisker çizgisi (Q3'ten yukarı)
    datasets.push({
        label: 'Üst Whisker',
        type: 'line',
        data: [
            { x: 1, y: q3 },
            { x: 1, y: upperWhisker }
        ],
        borderColor: 'rgba(75, 85, 99, 1)',
        borderWidth: 3,
        pointRadius: 0,
        tension: 0
    });
    
    // 5. Alt whisker cap
    datasets.push({
        label: 'Alt Cap',
        type: 'line',
        data: [
            { x: 0.8, y: lowerWhisker },
            { x: 1.2, y: lowerWhisker }
        ],
        borderColor: 'rgba(75, 85, 99, 1)',
        borderWidth: 3,
        pointRadius: 0,
        tension: 0
    });
    
    // 6. Üst whisker cap
    datasets.push({
        label: 'Üst Cap',
        type: 'line',
        data: [
            { x: 0.8, y: upperWhisker },
            { x: 1.2, y: upperWhisker }
        ],
        borderColor: 'rgba(75, 85, 99, 1)',
        borderWidth: 3,
        pointRadius: 0,
        tension: 0
    });
    
    // 7. Outliers (varsa)
    if (outliers.length > 0) {
        datasets.push({
            label: `Outliers (${outliers.length})`,
            type: 'scatter',
            data: outliers.map(val => ({ x: 1, y: val })),
            backgroundColor: 'rgba(239, 68, 68, 0.8)',
            borderColor: 'rgba(220, 38, 127, 1)',
            borderWidth: 2,
            pointRadius: 6,
            pointStyle: 'circle'
        });
    }
    
    return {
        type: 'scatter',
        data: { datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `Box Plot - Outliers: ${outliers.length} | IQR: ${iqr.toFixed(2)}`,
                    font: { size: 16, weight: 'bold' }
                },
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        filter: function(legendItem) {
                            // Sadece önemli elemanları göster
                            return ['Ana Kutu', 'Medyan', 'Outliers'].some(name => 
                                legendItem.text && legendItem.text.includes(name)
                            );
                        },
                        usePointStyle: true,
                        padding: 15
                    }
                },
                tooltip: {
                    callbacks: {
                        title: function() {
                            return 'Box Plot Değerleri';
                        },
                        label: function(context) {
                            const datasetLabel = context.dataset.label;
                            const value = context.parsed.y.toFixed(2);
                            
                            if (datasetLabel === 'Ana Kutu') {
                                return `Q1: ${q1.toFixed(2)} - Q3: ${q3.toFixed(2)}`;
                            } else if (datasetLabel === 'Medyan') {
                                return `Medyan: ${value}`;
                            } else if (datasetLabel && datasetLabel.includes('Outliers')) {
                                return `Outlier: ${value}`;
                            }
                            return `${datasetLabel}: ${value}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    min: 0.4,
                    max: 1.6,
                    display: false
                },
                y: {
                    title: {
                        display: true,
                        text: 'Değer',
                        font: { weight: 'bold', size: 14 }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)',
                        lineWidth: 1
                    },
                    ticks: {
                        font: { size: 12 }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'nearest'
            }
        }
    };
}

// Scatter Configuration
function createScatterConfig(dataset) {
    let scatterData = [];
    let outlierData = [];
    
    if(dataset.type === 'bivariate') {
        const xValues = dataset.data.map(d => d.x);
        const yValues = dataset.data.map(d => d.y);
        
        const xStats = calculateAdvancedStats(xValues);
        const yStats = calculateAdvancedStats(yValues);
        
        const xLowerBound = xStats.q1 - 1.5 * xStats.iqr;
        const xUpperBound = xStats.q3 + 1.5 * xStats.iqr;
        const yLowerBound = yStats.q1 - 1.5 * yStats.iqr;
        const yUpperBound = yStats.q3 + 1.5 * yStats.iqr;
        
        dataset.data.forEach(point => {
            const isOutlier = point.x < xLowerBound || point.x > xUpperBound || 
                            point.y < yLowerBound || point.y > yUpperBound;
            
            if (isOutlier) {
                outlierData.push(point);
            } else {
                scatterData.push(point);
            }
        });
    } else {
        const values = dataset.data.filter(v => typeof v === 'number');
        const stats = calculateAdvancedStats(values);
        const lowerBound = stats.q1 - 1.5 * stats.iqr;
        const upperBound = stats.q3 + 1.5 * stats.iqr;
        
        values.forEach((value, index) => {
            const point = { x: index + 1, y: value };
            const isOutlier = value < lowerBound || value > upperBound;
            
            if (isOutlier) {
                outlierData.push(point);
            } else {
                scatterData.push(point);
            }
        });
    }
    
    const datasets = [{
        label: 'Normal Veriler',
        data: scatterData,
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderColor: 'rgba(59, 130, 246, 1)',
        pointRadius: 6
    }];
    
    if (outlierData.length > 0) {
        datasets.push({
            label: `Outlier (${outlierData.length})`,
            data: outlierData,
            backgroundColor: 'rgba(239, 68, 68, 0.8)',
            borderColor: 'rgba(220, 38, 127, 1)',
            pointRadius: 8,
            pointStyle: 'triangle'
        });
    }
    
    return {
        type: 'scatter',
        data: { datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: dataset.type === 'bivariate' ? 
                          `Scatter Plot - Outlier: ${outlierData.length}` : 
                          `Scatter Plot - Outlier: ${outlierData.length}`,
                    font: { size: 16, weight: 'bold' }
                }
            },
            scales: {
                x: { title: { display: true, text: dataset.type === 'bivariate' ? 'X Değişkeni' : 'İndeks' } },
                y: { title: { display: true, text: dataset.type === 'bivariate' ? 'Y Değişkeni' : 'Değer' } }
            }
        }
    };
}

// Bar Configuration
function createBarConfig(dataset) {
    if(dataset.type === 'categorical') {
        const counts = {};
        dataset.data.forEach(item => {
            counts[item] = (counts[item] || 0) + 1;
        });
        
        const colors = [
            'rgba(59, 130, 246, 0.7)',
            'rgba(16, 185, 129, 0.7)',
            'rgba(245, 158, 11, 0.7)',
            'rgba(239, 68, 68, 0.7)',
            'rgba(168, 85, 247, 0.7)'
        ];
        
        return {
            type: 'bar',
            data: {
                labels: Object.keys(counts),
                datasets: [{
                    label: 'Frekans',
                    data: Object.values(counts),
                    backgroundColor: colors,
                    borderColor: colors.map(color => color.replace('0.7', '1')),
                    borderWidth: 2,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: { display: true, text: 'Bar Chart - Kategorik Veri', font: { size: 16, weight: 'bold' } },
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Frekans' } },
                    x: { title: { display: true, text: 'Kategori' } }
                }
            }
        };
    }
    
    return createHistogramConfig(dataset);
}

// Pie Configuration
function createPieConfig(dataset) {
    if(dataset.type === 'categorical') {
        const counts = {};
        dataset.data.forEach(item => {
            counts[item] = (counts[item] || 0) + 1;
        });
        
        const colors = [
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(168, 85, 247, 0.8)'
        ];
        
        return {
            type: 'pie',
            data: {
                labels: Object.keys(counts),
                datasets: [{
                    data: Object.values(counts),
                    backgroundColor: colors,
                    borderWidth: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: { display: true, text: 'Pie Chart - Kategorik Veri Oranları', font: { size: 16, weight: 'bold' } },
                    legend: { position: 'bottom' }
                }
            }
        };
    }
    
    return createHistogramConfig(dataset);
}

// Line Configuration (DÜZELTME - TÜM VERİLERİ GÖSTER)
function createLineConfig(dataset) {
    if(dataset.type === 'categorical') {
        return createBarConfig(dataset);
    }
    
    let lineData = [];
    
    if(dataset.type === 'bivariate') {
        // İki değişkenli veri için X değerlerini zaman serisi olarak göster
        lineData = dataset.data.map((point, index) => ({
            x: index + 1,
            y: point.x
        }));
    } else {
        // Tek değişkenli sayısal veri için tüm değerleri göster
        const values = dataset.data.filter(v => typeof v === 'number');
        lineData = values.map((value, index) => ({
            x: index + 1,
            y: value
        }));
    }
    
    return {
        type: 'line',
        data: {
            datasets: [{
                label: 'Veri Trendi',
                data: lineData,
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                borderColor: 'rgba(34, 197, 94, 1)',
                borderWidth: 2,
                fill: true,
                tension: 0.3,
                pointBackgroundColor: 'rgba(34, 197, 94, 1)',
                pointBorderColor: 'white',
                pointBorderWidth: 2,
                pointRadius: 3,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: 'rgba(34, 197, 94, 1)',
                pointHoverBorderColor: 'white',
                pointHoverBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `Line Chart - Toplam ${lineData.length} Veri Noktası`,
                    font: { size: 16, weight: 'bold' }
                },
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 15
                    }
                },
                tooltip: {
                    callbacks: {
                        title: function(context) {
                            return `Veri Noktası: ${context[0].label}`;
                        },
                        label: function(context) {
                            return `Değer: ${context.parsed.y.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    title: {
                        display: true,
                        text: dataset.type === 'bivariate' ? 'Zaman/İndeks' : 'Veri Sırası',
                        font: { weight: 'bold', size: 12 }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)',
                        lineWidth: 1
                    },
                    ticks: {
                        maxTicksLimit: 10,
                        callback: function(value) {
                            return Math.round(value);
                        }
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Değer',
                        font: { weight: 'bold', size: 12 }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)',
                        lineWidth: 1
                    },
                    ticks: {
                        maxTicksLimit: 8,
                        callback: function(value) {
                            return value.toFixed(1);
                        }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            },
            elements: {
                line: {
                    tension: 0.3
                }
            }
        }
    };
}

// Update Statistics - SADECE İstatistiksel Bilgiler (TEK BAŞLIK)
function updateStatistics(dataset, chartType) {
    let statsHTML = '<h3><i class="fas fa-chart-bar"></i> İstatistiksel Bilgiler</h3>';
    
    if(dataset.type === 'categorical') {
        const counts = {};
        dataset.data.forEach(item => {
            counts[item] = (counts[item] || 0) + 1;
        });
        
        const total = dataset.data.length;
        const categories = Object.keys(counts);
        const mode = categories.reduce((a, b) => counts[a] > counts[b] ? a : b);
        const entropy = calculateEntropy(Object.values(counts));
        
        statsHTML += '<div class="stats-content">';
        statsHTML += `<div class="stat-item"><span>Toplam Veri:</span><span>${total}</span></div>`;
        statsHTML += `<div class="stat-item"><span>Kategori Sayısı:</span><span>${categories.length}</span></div>`;
        statsHTML += `<div class="stat-item"><span>En Sık Kategori:</span><span>${mode}</span></div>`;
        statsHTML += `<div class="stat-item"><span>Frekans:</span><span>${counts[mode]} kez</span></div>`;
        statsHTML += `<div class="stat-item"><span>Entropi:</span><span>${entropy.toFixed(3)}</span></div>`;
        statsHTML += `<div class="stat-item"><span>Dağılım Dengesi:</span><span>${entropy > 1.5 ? 'Dengeli' : 'Dengesiz'}</span></div>`;
        statsHTML += '</div>';
        
    } else if(dataset.type === 'bivariate') {
        const xValues = dataset.data.map(d => d.x);
        const yValues = dataset.data.map(d => d.y);
        
        const xStats = calculateBasicStats(xValues);
        const yStats = calculateBasicStats(yValues);
        const correlation = calculateCorrelation(xValues, yValues);
        
        statsHTML += '<div class="stats-content">';
        statsHTML += `<div class="stat-item"><span>X Ortalama:</span><span>${xStats.mean.toFixed(2)}</span></div>`;
        statsHTML += `<div class="stat-item"><span>Y Ortalama:</span><span>${yStats.mean.toFixed(2)}</span></div>`;
        statsHTML += `<div class="stat-item"><span>X Std. Sapma:</span><span>${xStats.std.toFixed(2)}</span></div>`;
        statsHTML += `<div class="stat-item"><span>Y Std. Sapma:</span><span>${yStats.std.toFixed(2)}</span></div>`;
        statsHTML += `<div class="stat-item"><span>Korelasyon (r):</span><span>${correlation.toFixed(3)}</span></div>`;
        statsHTML += `<div class="stat-item"><span>İlişki Gücü:</span><span>${getCorrelationStrength(correlation)}</span></div>`;
        statsHTML += '</div>';
        
    } else {
        const values = dataset.data.filter(v => typeof v === 'number');
        const stats = calculateAdvancedStats(values);
        
        statsHTML += '<div class="stats-content">';
        statsHTML += `<div class="stat-item"><span>Veri Sayısı:</span><span>${stats.count}</span></div>`;
        statsHTML += `<div class="stat-item"><span>Ortalama:</span><span>${stats.mean.toFixed(2)}</span></div>`;
        statsHTML += `<div class="stat-item"><span>Medyan:</span><span>${stats.median.toFixed(2)}</span></div>`;
        statsHTML += `<div class="stat-item"><span>Std. Sapma:</span><span>${stats.std.toFixed(2)}</span></div>`;
        statsHTML += `<div class="stat-item"><span>Minimum:</span><span>${stats.min.toFixed(2)}</span></div>`;
        statsHTML += `<div class="stat-item"><span>Maksimum:</span><span>${stats.max.toFixed(2)}</span></div>`;
        statsHTML += `<div class="stat-item"><span>Q1:</span><span>${stats.q1.toFixed(2)}</span></div>`;
        statsHTML += `<div class="stat-item"><span>Q3:</span><span>${stats.q3.toFixed(2)}</span></div>`;
        statsHTML += `<div class="stat-item"><span>Çarpıklık:</span><span>${stats.skewness.toFixed(3)}</span></div>`;
        statsHTML += `<div class="stat-item"><span>Outlier Sayısı:</span><span>${stats.outliers}</span></div>`;
        statsHTML += '</div>';
    }
    
    statsContent.innerHTML = statsHTML;
}

// Update Interpretation - Grafik Açıklaması (DÜZELTME)
function updateInterpretation(chartType, dataset) {
    const chartInfo = {
        histogram: {
            title: "📊 Histogram Nedir?",
            description: "Sürekli sayısal verilerin dağılımını çubuklar halinde gösteren grafiktir.",
            usage: "🎯 Veri dağılımının şeklini anlamak, normallik kontrolü yapmak için kullanılır.",
            interpretation: "📈 Y ekseni frekansı, X ekseni değer aralıklarını gösterir. Yüksek çubuklar o aralıkta daha çok veri olduğunu belirtir."
        },
        boxplot: {
            title: "📦 Box Plot Nedir?",
            description: "Verilerin beş sayı özeti (Min, Q1, Medyan, Q3, Max) ve aykırı değerleri gösteren grafiktir.",
            usage: "🎯 Medyan, çeyrekler ve aykırı değerleri görmek, farklı grupları hızlıca karşılaştırmak için kullanılır.",
            interpretation: "📈 Kutu %50 veriyi kapsar (Q1-Q3 arası). Medyan ortadaki yeşil çubuk. Min/Max uç değerler. IQR = Q3 - Q1."
        },
        scatter: {
            title: "🎯 Scatter Plot Nedir?",
            description: "İki sürekli değişken arasındaki ilişkiyi noktalar halinde gösteren grafiktir.",
            usage: "🎯 İki değişken arasındaki korelasyonu görmek, ilişki analizi yapmak için kullanılır.",
            interpretation: "📈 Her nokta bir gözlemi temsil eder. Noktalar çizgi şeklinde diziliyorsa güçlü ilişki, dağınıksa zayıf ilişki vardır."
        },
        bar: {
            title: "📊 Bar Chart Nedir?",
            description: "Kategorik verilerin frekanslarını karşılaştıran grafiktir.",
            usage: "🎯 Kategoriler arası frekans farklarını görmek, en sık kategorileri belirlemek için kullanılır.",
            interpretation: "📈 Her çubuğun yüksekliği o kategorinin sıklığını gösterir. Uzun çubuk = daha sık kategori."
        },
        pie: {
            title: "🍰 Pie Chart Nedir?",
            description: "Kategorik verilerin toplam içindeki oranlarını gösteren dairesel grafiktir.",
            usage: "🎯 Kategorilerin toplam içindeki payını görmek, oransal dağılımları anlamak için kullanılır.",
            interpretation: "📈 Her dilim bir kategoriyi temsil eder. Büyük dilim = yüksek oran, küçük dilim = düşük oran."
        },
        line: {
            title: "📈 Line Chart Nedir?",
            description: "Verilerin zaman içindeki değişimini ve trendini gösteren grafiktir.",
            usage: "🎯 Zaman serisi verilerini analiz etmek, trend ve döngüleri tespit etmek için kullanılır.",
            interpretation: "📈 Çizginin yükselip alçalması değişim yönünü, eğimi ise değişim hızını gösterir."
        }
    };
    
    const info = chartInfo[chartType];
    if (!info) {
        interpretationContent.innerHTML = '<p>Grafik bilgisi bulunamadı.</p>';
        return;
    }
    
    const interpretationHTML = `
        <h3><i class="fas fa-info-circle"></i> Seçilen Grafik Hakkında</h3>
        <div class="chart-info-box">
            <h4>${info.title}</h4>
            <p><strong>📋 Tanım:</strong> ${info.description}</p>
            <p><strong>${info.usage}</strong></p>
            <p><strong>🔍 Nasıl Yorumlanır:</strong> ${info.interpretation}</p>
        </div>
    `;
    
    interpretationContent.innerHTML = interpretationHTML;
}

// Calculate Basic Statistics
function calculateBasicStats(values) {
    const n = values.length;
    const mean = values.reduce((a, b) => a + b, 0) / n;
    const variance = values.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / (n - 1);
    const std = Math.sqrt(variance);
    
    return { mean, std, variance };
}

// Calculate Advanced Statistics
function calculateAdvancedStats(values) {
    const n = values.length;
    const sorted = [...values].sort((a, b) => a - b);
    
    const mean = values.reduce((a, b) => a + b, 0) / n;
    const median = sorted[Math.floor(n / 2)];
    const min = sorted[0];
    const max = sorted[n - 1];
    
    const q1 = sorted[Math.floor(n * 0.25)];
    const q3 = sorted[Math.floor(n * 0.75)];
    const iqr = q3 - q1;
    
    const variance = values.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / (n - 1);
    const std = Math.sqrt(variance);
    
    const skewness = values.reduce((sum, x) => sum + Math.pow((x - mean) / std, 3), 0) / n;
    const kurtosis = values.reduce((sum, x) => sum + Math.pow((x - mean) / std, 4), 0) / n - 3;
    
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    const outliers = values.filter(v => v < lowerBound || v > upperBound).length;
    
    return {
        count: n, mean, median, min, max, q1, q3, std, variance,
        skewness, kurtosis, outliers, iqr
    };
}

// Calculate Correlation
function calculateCorrelation(xValues, yValues) {
    const n = xValues.length;
    const xMean = xValues.reduce((a, b) => a + b, 0) / n;
    const yMean = yValues.reduce((a, b) => a + b, 0) / n;
    
    let numerator = 0;
    let xVariance = 0;
    let yVariance = 0;
    
    for(let i = 0; i < n; i++) {
        const xDiff = xValues[i] - xMean;
        const yDiff = yValues[i] - yMean;
        numerator += xDiff * yDiff;
        xVariance += xDiff * xDiff;
        yVariance += yDiff * yDiff;
    }
    
    return numerator / Math.sqrt(xVariance * yVariance);
}

// Calculate Entropy
function calculateEntropy(frequencies) {
    const total = frequencies.reduce((a, b) => a + b, 0);
    return frequencies.reduce((entropy, freq) => {
        if(freq === 0) return entropy;
        const p = freq / total;
        return entropy - p * Math.log2(p);
    }, 0);
}

// Get Correlation Strength
function getCorrelationStrength(r) {
    const abs = Math.abs(r);
    if(abs >= 0.8) return 'Çok Güçlü';
    if(abs >= 0.6) return 'Güçlü';
    if(abs >= 0.4) return 'Orta';
    if(abs >= 0.2) return 'Zayıf';
    return 'Çok Zayıf';
}

// Update Data Table
function updateDataTable(dataset, dataType) {
    let tableHTML = '';
    
    if(dataset.type === 'categorical') {
        const counts = {};
        dataset.data.forEach(item => {
            counts[item] = (counts[item] || 0) + 1;
        });
        
        const total = dataset.data.length;
        
        tableHTML = `
            <h4><i class="fas fa-table"></i> Kategori Dağılımı</h4>
            <table>
                <thead>
                    <tr>
                        <th>Kategori</th>
                        <th>Frekans</th>
                        <th>Oran (%)</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        Object.entries(counts).forEach(([category, count]) => {
            const percentage = (count / total * 100).toFixed(1);
            tableHTML += `
                <tr>
                    <td>${category}</td>
                    <td>${count}</td>
                    <td>${percentage}%</td>
                </tr>
            `;
        });
        
        tableHTML += '</tbody></table>';
        
    } else if(dataset.type === 'bivariate') {
        tableHTML = `
            <h4><i class="fas fa-table"></i> İki Değişkenli Veri (İlk 10 Satır)</h4>
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>X</th>
                        <th>Y</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        dataset.data.slice(0, 10).forEach((point, index) => {
            tableHTML += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${point.x.toFixed(2)}</td>
                    <td>${point.y.toFixed(2)}</td>
                </tr>
            `;
        });
        
        tableHTML += '</tbody></table>';
        
    } else {
        const values = dataset.data.filter(v => typeof v === 'number');
        
        tableHTML = `
            <h4><i class="fas fa-table"></i> Sayısal Veri (İlk 10 Değer)</h4>
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Değer</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        values.slice(0, 10).forEach((value, index) => {
            tableHTML += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${value.toFixed(2)}</td>
                </tr>
            `;
        });
        
        tableHTML += '</tbody></table>';
    }
    
    dataTableContainer.innerHTML = tableHTML;
}

// Download Chart
function downloadChart() {
    if(currentChart) {
        const link = document.createElement('a');
        link.download = `istatistik-grafik-${Date.now()}.png`;
        link.href = currentChart.toBase64Image();
        link.click();
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);