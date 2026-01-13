// Datos farmacocinéticos de estimulantes para TDAH
// Basado en: Banaschewski T et al. Eur Child Adol Psych 2006
// Nottinghamshire APC Methylphenidate Switching Protocol
const medications = {
    'rubifen': {
        name: 'Metilfenidato LI (Rubifen®)',
        color: '#e74c3c',
        tmax: 1.5,
        halfLife: 2.5,
        onset: 0.5,
        info: 'Tipo IR - Liberación Inmediata - Tmax: 1-2h, Duración: 3-4h',
        doses: [5, 10, 20],
        defaultDose: 10,
        irRatio: 1.0, // 100% IR
        presentation: 'Comprimidos blancos ranurados',
        boxColor: '#ffffff',
        pillShape: 'round',
        imageUrl: 'images/rubifen.png'
    },
    'medikinet': {
        name: 'Metilfenidato 50:50 (Medikinet®, Rubifen Prolong®)',
        color: '#e67e22',
        tmax: 3.5,
        halfLife: 2.5,
        onset: 0.5,
        bimodal: true,
        ratio: [0.5, 0.5],
        delay: 4,
        info: '50% IR (0-4h) + 50% MR (4-8h) - Mayor efecto matutino',
        doses: [5, 10, 20, 30, 40, 50, 60],
        defaultDose: 30,
        irRatio: 0.5, // 50% IR
        presentation: 'Cápsulas azul/blanco con microesferas',
        boxColor: '#4A90E2',
        pillShape: 'capsule',
        imageUrl: 'images/medikinet.png'
    },
    'equasym': {
        name: 'Metilfenidato 30:70 (Equasym®)',
        color: '#f39c12',
        tmax: 5,
        halfLife: 2.5,
        onset: 0.5,
        bimodal: true,
        ratio: [0.3, 0.7],
        delay: 4.5,
        info: '30% IR (0-4h) + 70% MR (4-8h) - Duración: ~8h',
        doses: [10, 20, 30, 40, 50, 60],
        defaultDose: 30,
        irRatio: 0.3, // 30% IR
        presentation: 'Cápsulas marrón/blanco con microesferas',
        boxColor: '#8B4513',
        pillShape: 'capsule',
        imageUrl: 'images/equasym.png'
    },
    'concerta': {
        name: 'Metilfenidato OROS 22:78 (Concerta®, Atenza®, Rubicrono®)',
        color: '#3498db',
        tmax: 6.5,
        halfLife: 2.5,
        onset: 1,
        oros: true,
        info: '22% IR + 78% liberación osmótica - Mayor efecto vespertino (4-12h)',
        doses: [18, 27, 36, 54, 72],
        defaultDose: 36,
        irRatio: 0.22, // 22% IR
        presentation: 'Comprimidos oblongos (amarillo/blanco/rojo según dosis)',
        boxColor: '#FFD700',
        pillShape: 'oblong',
        imageUrl: 'images/concerta.png'
    },
    'lisdexanfetamina': {
        name: 'Lisdexanfetamina (Elvanse®)',
        color: '#2ecc71',
        tmax: 3.5,
        halfLife: 10,
        onset: 1.0,
        info: 'Profármaco - Saturación enzimática limita conversión → efecto prolongado (12-13h)',
        doses: [30, 50, 70],
        defaultDose: 50,
        isProdrug: true, // Profármaco - conversión enzimática a d-anfetamina
        mtfEquivalence: 2.0, // 1mg lisdexanfetamina ≈ 2mg metilfenidato
        irRatio: 1.0, // Se considera como dosis completa para el cálculo
        presentation: 'Cápsulas con código impreso (blanco/naranja/azul)',
        boxColor: '#FF6B35',
        pillShape: 'capsule',
        imageUrl: 'images/elvanse.png'
    }
};

let chart = null;
const selectedMeds = new Set();
let therapeuticThreshold = 30;
let sideEffectsThreshold = 80;
let rubifenVespertino = false;
let patientWeight = 20; // Peso en kg (por defecto 20kg pediátrico)
let autoDose = true; // Activar ajuste automático de dosis
const selectedDoses = {
    'rubifen': 10,
    'medikinet': 30,
    'equasym': 30,
    'concerta': 36,
    'lisdexanfetamina': 50
};

// Función para calcular dosis recomendadas según bibliografía
// Basado en 0.5 mg/kg de metilfenidato LI equivalente
function calculateRecommendedDoses(weight) {
    const targetMgKg = 0.5; // mg/kg de MPH IR objetivo
    const targetMg = weight * targetMgKg; // mg totales de MPH IR
    
    const recommendations = {};
    
    Object.keys(medications).forEach(medKey => {
        const med = medications[medKey];
        
        // Lisdexanfetamina: calcular basado en equivalencia MTF
        if (med.isProdrug) {
            // Objetivo: 0.5 mg/kg MTF IR → dividir por equivalencia MTF
            const lisdexDosePerKg = targetMgKg / (med.mtfEquivalence || 2.0);
            const calculatedDose = weight * lisdexDosePerKg;
            
            const availableDoses = med.doses;
            let recommendedDose = availableDoses[0];
            
            for (let i = 0; i < availableDoses.length; i++) {
                if (Math.abs(availableDoses[i] - calculatedDose) < Math.abs(recommendedDose - calculatedDose)) {
                    recommendedDose = availableDoses[i];
                }
            }
            recommendations[medKey] = recommendedDose;
        } else {
            // Para metilfenidato: calcular según componente IR
            const irRatio = med.irRatio;
            const calculatedDose = targetMg / irRatio;
            
            const availableDoses = med.doses;
            let recommendedDose = availableDoses[0];
            
            for (let i = 0; i < availableDoses.length; i++) {
                if (Math.abs(availableDoses[i] - calculatedDose) < Math.abs(recommendedDose - calculatedDose)) {
                    recommendedDose = availableDoses[i];
                }
            }
            recommendations[medKey] = recommendedDose;
        }
    });
    
    return recommendations;
}

// Función para aplicar dosis recomendadas
function applyRecommendedDoses(weight) {
    const recommendations = calculateRecommendedDoses(weight);
    
    Object.keys(recommendations).forEach(medKey => {
        selectedDoses[medKey] = recommendations[medKey];
        
        // Actualizar el selector de dosis en la UI
        const doseSelector = document.getElementById(`dose-${medKey}`);
        if (doseSelector) {
            doseSelector.value = recommendations[medKey];
            
            // Actualizar la dosis mostrada
            const med = medications[medKey];
            const irEquivElement = document.getElementById(`ir-equiv-${medKey}`);
            if (irEquivElement) {
                if (med.isProdrug) {
                    // Para lisdexanfetamina: mostrar equivalencia MTF
                    const mtfEquiv = (recommendations[medKey] * (med.mtfEquivalence || 2.0)).toFixed(1);
                    irEquivElement.textContent = `≈ ${mtfEquiv}mg MTF equiv.`;
                } else {
                    // Para metilfenidato: mostrar IR equivalente
                    const irEquiv = (recommendations[medKey] * med.irRatio).toFixed(1);
                    irEquivElement.textContent = `≈ ${irEquiv}mg IR equivalente`;
                }
            }
        }
    });
}
function calculateConcentration(time, med, doseMultiplier = 1.0) {
    const { tmax, halfLife, onset, bimodal, oros, ratio, delay, isProdrug } = med;
    const ka = Math.log(2) / (tmax / 2.5);
    const ke = Math.log(2) / halfLife;
    
    if (time < onset) return 0;
    
    const adjustedTime = time - onset;
    let conc = 0;
    
    if (isProdrug) {
        // Lisdexanfetamina: Modelo de saturación enzimática (Michaelis-Menten)
        // El profármaco se absorbe rápidamente pero se convierte lentamente a d-anfetamina
        // debido a la capacidad limitada de las enzimas en eritrocitos
        
        // Parámetros del modelo de saturación
        const Vmax = 8.0;      // Velocidad máxima de conversión (unidades: dosis/hora)
        const Km = 20.0;       // Constante de Michaelis (concentración a la que v = Vmax/2)
        const kaProdrug = 3.0; // Constante de absorción del profármaco (rápida)
        
        // Concentración de profármaco absorbido disponible para conversión
        const prodrug = doseMultiplier * 100 * (1 - Math.exp(-kaProdrug * adjustedTime));
        
        // Cinética de Michaelis-Menten para conversión saturable
        // A dosis bajas: cinética de primer orden (proporcional a dosis)
        // A dosis altas: cinética de orden cero (constante, saturada)
        const conversionFactor = prodrug / (Km + prodrug);
        
        // Formación de fármaco activo (d-anfetamina) con saturación
        // El factor de saturación limita la conversión a altas dosis
        const timeToMaxConversion = tmax - onset;
        const formationRate = (Vmax * conversionFactor) / Vmax; // Normalizado
        
        // Modelo bicompartimental: formación saturada + eliminación
        const kForm = formationRate * 0.5; // Constante de formación limitada
        
        // Fármaco activo con cinética saturable
        const formation = (kForm / (kForm - ke)) * 
            (Math.exp(-ke * adjustedTime) - Math.exp(-kForm * adjustedTime));
        
        // Aplicar el factor de saturación: menos conversión a dosis altas
        conc = formation * (1 + 0.5 * (1 - conversionFactor)) * doseMultiplier * 50;
    } else if (oros) {
        // Sistema OROS Tipo 1 (22:78): Concerta XL, Atenza XL
        // Duración terapéutica: 8-12h
        const f1 = 0.22 * doseMultiplier;
        const f2 = 0.78 * doseMultiplier;
        const releaseDuration = 12; // Liberación extendida durante 12 horas
        
        // Componente IR (22%) - absorción rápida
        const conc1 = f1 * (ka / (ka - ke)) * 
            (Math.exp(-ke * adjustedTime) - Math.exp(-ka * adjustedTime));
        
        // Componente OROS (78%) - liberación continua con eliminación
        // Modelo de infusión con eliminación simultánea
        let conc2;
        if (adjustedTime <= releaseDuration) {
            // Durante la liberación: entrada constante - eliminación
            const k0 = f2 / releaseDuration;
            conc2 = (k0 / ke) * (1 - Math.exp(-ke * adjustedTime));
        } else {
            // Después de la liberación: solo eliminación
            const steadyState = (f2 / releaseDuration / ke) * (1 - Math.exp(-ke * releaseDuration));
            conc2 = steadyState * Math.exp(-ke * (adjustedTime - releaseDuration));
        }
        
        conc = conc1 + conc2;
    } else if (bimodal) {
        // Sistemas bimodales: Tipo 2 (30:70) y Tipo 3 (50:50)
        const f1 = (ratio ? ratio[0] : 0.5) * doseMultiplier;
        const f2 = (ratio ? ratio[1] : 0.5) * doseMultiplier;
        const delayTime = delay || 4;
        
        // Primera fase IR
        const ka1 = ka * 1.5;
        const conc1 = f1 * (ka1 / (ka1 - ke)) * 
            (Math.exp(-ke * adjustedTime) - Math.exp(-ka1 * adjustedTime));
        
        // Segunda fase MR (retardada)
        const ka2 = ka * 0.7;
        const conc2 = adjustedTime > delayTime ? 
            f2 * (ka2 / (ka2 - ke)) * 
            (Math.exp(-ke * (adjustedTime - delayTime)) - Math.exp(-ka2 * (adjustedTime - delayTime))) : 0;
        
        conc = conc1 + conc2;
    } else {
        // Liberación inmediata
        conc = doseMultiplier * (ka / (ka - ke)) * 
            (Math.exp(-ke * adjustedTime) - Math.exp(-ka * adjustedTime));
    }
    
    // Normalizar al pico (ajustado por la dosis)
    const peakTime = Math.log(ka / ke) / (ka - ke);
    const peakConc = (ka / (ka - ke)) * 
        (Math.exp(-ke * peakTime) - Math.exp(-ka * peakTime));
    
    return (conc / peakConc) * 100;
}

// Generar datos de la curva
function generateCurveData(medKey) {
    const med = medications[medKey];
    const points = [];
    const startTime = 6; // 06:00h
    const endTime = 22;  // 22:00h
    
    // Calcular dosis equivalente basada en componente IR
    const actualDose = selectedDoses[medKey];
    const irComponent = actualDose * med.irRatio;
    
    // Aplicar equivalencia a MTF para lisdexanfetamina
    const mtfEquivalence = med.mtfEquivalence || 1.0;
    const equivalentIRDose = irComponent * mtfEquivalence;
    
    // NO normalizamos, trabajamos directamente con mg
    const doseMultiplier = equivalentIRDose / 10; // 10mg IR = 1.0
    
    for (let t = startTime; t <= endTime; t += 0.1) {
        const adjustedT = t - startTime; // Ajustar para el cálculo
        // Concentración en % multiplicada por dosis equivalente = mg en plasma
        // Luego dividir por peso para obtener mg/kg
        let concentration = calculateConcentration(adjustedT, med, doseMultiplier) * equivalentIRDose / 100 / patientWeight;
        
        // Si está activada la dosis vespertina de Rubifen, agregarla a TODAS las presentaciones
        if (rubifenVespertino && t >= 16) {
            const rubifenMed = medications['rubifen'];
            const rubifenDose = selectedDoses['rubifen'];
            const rubifenIrComponent = rubifenDose * rubifenMed.irRatio;
            const rubifenEquivalentIRDose = rubifenIrComponent;
            const rubifenDoseMultiplier = rubifenEquivalentIRDose / 10;
            
            const adjustedT2 = t - 16; // Dosis a las 16h
            concentration += calculateConcentration(adjustedT2, rubifenMed, rubifenDoseMultiplier) * rubifenEquivalentIRDose / 100 / patientWeight;
        }
        
        points.push({
            x: t,
            y: concentration
        });
    }
    
    return points;
}

// Calcular el máximo Y de todas las curvas activas
function getMaxYValue() {
    if (selectedMeds.size === 0) return 0.5; // Valor por defecto si no hay medicamentos
    
    let maxY = 0;
    selectedMeds.forEach(medKey => {
        const data = generateCurveData(medKey);
        const localMax = Math.max(...data.map(p => p.y));
        if (localMax > maxY) maxY = localMax;
    });
    
    // Añadir un margen del 10% para que las curvas no toquen el borde superior
    maxY = maxY * 1.1;
    
    // Redondear hacia arriba con lógica adaptativa
    if (maxY < 0.1) {
        return Math.ceil(maxY * 100) / 100; // Redondear a 0.01 mg/kg
    } else if (maxY < 1) {
        return Math.ceil(maxY * 20) / 20; // Redondear a 0.05 mg/kg
    } else if (maxY < 5) {
        return Math.ceil(maxY * 2) / 2; // Redondear a 0.5 mg/kg
    } else {
        return Math.ceil(maxY); // Redondear a 1 mg/kg
    }
}

// Crear gráfico
function createChart() {
    const ctx = document.getElementById('pkChart').getContext('2d');
    
    const datasets = Array.from(selectedMeds).map(medKey => ({
        label: medications[medKey].name,
        data: generateCurveData(medKey),
        borderColor: medications[medKey].color,
        backgroundColor: medications[medKey].color + '20',
        borderWidth: 3,
        fill: false,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6
    }));
    
    // Calcular el máximo del eje Y dinámicamente
    const maxY = getMaxYValue();
    const yMax = maxY; // Usar directamente el valor calculado
    
    // Calcular posiciones de umbrales en mg/kg
    const therapeuticMg = (therapeuticThreshold / 100) * maxY;
    const sideEffectsMg = (sideEffectsThreshold / 100) * maxY;
    
    // Añadir líneas de umbral
    datasets.push({
        label: 'Umbral Terapéutico',
        data: [{x: 6, y: therapeuticMg}, {x: 22, y: therapeuticMg}],
        borderColor: '#27ae60',
        borderWidth: 2,
        borderDash: [10, 5],
        fill: false,
        pointRadius: 0,
        pointHoverRadius: 0
    });
    
    datasets.push({
        label: 'Umbral Efectos Secundarios',
        data: [{x: 6, y: sideEffectsMg}, {x: 22, y: sideEffectsMg}],
        borderColor: '#c0392b',
        borderWidth: 2,
        borderDash: [10, 5],
        fill: false,
        pointRadius: 0,
        pointHoverRadius: 0
    });
    
    if (chart) {
        chart.destroy();
    }
    
    chart = new Chart(ctx, {
        type: 'line',
        data: { datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: `Concentración Plasmática vs Tiempo - Paciente ${patientWeight}kg`,
                    font: { size: 20, weight: 'bold' },
                    padding: 20
                },
                tooltip: {
                    mode: 'nearest',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + 
                                   context.parsed.y.toFixed(3) + ' mg/kg equiv. MPH IR';
                        },
                        title: function(context) {
                            const hour = Math.floor(context[0].parsed.x);
                            const minutes = Math.round((context[0].parsed.x - hour) * 60);
                            return `Hora: ${hour}:${minutes.toString().padStart(2, '0')}h`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    title: {
                        display: true,
                        text: 'Hora del Día',
                        font: { size: 16, weight: 'bold' }
                    },
                    min: 6,
                    max: 22,
                    ticks: { 
                        stepSize: 2, 
                        font: { size: 14 },
                        callback: function(value) {
                            return value + ':00h';
                        }
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Concentración Plasmática (mg/kg equiv. Metilfenidato IR)',
                        font: { size: 16, weight: 'bold' }
                    },
                    min: 0,
                    max: yMax,
                    ticks: { 
                        stepSize: yMax < 0.5 ? 0.05 : (yMax < 2 ? 0.1 : 0.5),
                        font: { size: 14 },
                        callback: function(value) {
                            return value.toFixed(3) + ' mg/kg';
                        }
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
    
    updateLegend();
}

// Actualizar solo los umbrales (sin recalcular las curvas)
function updateThresholds() {
    if (!chart) return;
    
    const maxY = getMaxYValue();
    const therapeuticMg = (therapeuticThreshold / 100) * maxY;
    const sideEffectsMg = (sideEffectsThreshold / 100) * maxY;
    
    // Actualizar datos de los datasets de umbral (últimos 2)
    const datasets = chart.data.datasets;
    if (datasets.length >= 2) {
        datasets[datasets.length - 2].data = [
            {x: 6, y: therapeuticMg}, 
            {x: 22, y: therapeuticMg}
        ];
        datasets[datasets.length - 1].data = [
            {x: 6, y: sideEffectsMg}, 
            {x: 22, y: sideEffectsMg}
        ];
    }
    
    chart.update('none'); // 'none' desactiva animaciones
}

// Actualizar leyenda personalizada
function updateLegend() {
    const legend = document.getElementById('customLegend');
    legend.innerHTML = '';
    
    selectedMeds.forEach(medKey => {
        const med = medications[medKey];
        const item = document.createElement('div');
        item.className = 'legend-item';
        item.innerHTML = `
            <div class="legend-color" style="background-color: ${med.color}"></div>
            <strong>${med.name}</strong>
        `;
        legend.appendChild(item);
    });
}

// Función para generar SVG de respaldo si no hay imagen
function getPillSVG(shape, color) {
    if (shape === 'round') {
        return `<div class="pill-visual round" style="background: ${color}; border: 2px solid #ccc;"></div>`;
    } else if (shape === 'capsule') {
        return `<div class="pill-visual capsule" style="background: linear-gradient(90deg, ${color} 50%, #ffffff 50%);"></div>`;
    } else if (shape === 'oblong') {
        return `<div class="pill-visual oblong" style="background: ${color};"></div>`;
    }
}

// Crear controles de medicamentos
function createMedicationControls() {
    const controls = document.getElementById('medicationControls');
    
    Object.keys(medications).forEach(medKey => {
        const med = medications[medKey];
        const card = document.createElement('div');
        card.className = 'medication-card';
        
        // Crear visualización de la forma del comprimido/cápsula
        let pillVisual = '';
        
        // Intentar cargar imagen real, si falla usar SVG de respaldo
        pillVisual = `
            <img src="${med.imageUrl}" 
                 alt="${med.name}" 
                 class="pill-image"
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div class="pill-fallback" style="display:none;">
                ${getPillSVG(med.pillShape, med.boxColor)}
            </div>
        `;
        
        // Crear opciones del selector de dosis
        const doseOptions = med.doses.map(dose => 
            `<option value="${dose}" ${dose === med.defaultDose ? 'selected' : ''}>${dose}mg</option>`
        ).join('');
        
        // Calcular dosis IR equivalente para mostrar
        const mtfEquiv = med.mtfEquivalence || 1.0;
        const irEquivalent = (med.defaultDose * med.irRatio * mtfEquiv).toFixed(1);
        
        card.innerHTML = `
            <div class="med-header">
                <div class="med-title-section">
                    <label>
                        <input type="checkbox" id="${medKey}" value="${medKey}">
                        <span>${med.name}</span>
                    </label>
                </div>
                <div class="pill-box" style="border: 3px solid ${med.boxColor};">
                    ${pillVisual}
                </div>
            </div>
            <div class="med-info">${med.info}</div>
            <div class="med-details">
                <div class="detail-item">
                    <strong>📦 Presentación:</strong> ${med.presentation}
                </div>
                <div class="detail-item">
                    <strong>💊 Dosis disponibles:</strong> ${med.doses.join('mg, ')}mg
                </div>
            </div>
            <div class="dose-selector-container">
                <label for="dose-${medKey}" class="dose-label">
                    Dosis: 
                </label>
                <select id="dose-${medKey}" class="dose-select">
                    ${doseOptions}
                </select>
                <div class="ir-equivalent" id="ir-equiv-${medKey}">
                    ≈ ${irEquivalent}mg IR equivalente
                </div>
            </div>
        `;
        
        const checkbox = card.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                selectedMeds.add(medKey);
            } else {
                selectedMeds.delete(medKey);
            }
            createChart();
        });
        
        const doseSelector = card.querySelector(`#dose-${medKey}`);
        doseSelector.addEventListener('change', (e) => {
            const newDose = parseInt(e.target.value);
            selectedDoses[medKey] = newDose;
            
            // Actualizar dosis IR equivalente
            const mtfEquiv = med.mtfEquivalence || 1.0;
            const irEquiv = (newDose * med.irRatio * mtfEquiv).toFixed(1);
            const label = med.isProdrug ? 'MTF equiv.' : 'IR equivalente';
            document.getElementById(`ir-equiv-${medKey}`).textContent = `≈ ${irEquiv}mg ${label}`;
            
            if (selectedMeds.has(medKey)) {
                createChart();
            }
        });
        
        controls.appendChild(card);
    });
}

// Inicializar
createMedicationControls();

// Seleccionar medicamentos por defecto (todos excepto lisdexanfetamina)
Object.keys(medications).forEach(med => {
    if (med !== 'lisdexanfetamina') {
        selectedMeds.add(med);
        document.getElementById(med).checked = true;
    }
});

// Aplicar dosis recomendadas iniciales
applyRecommendedDoses(patientWeight);

// Event listeners para los sliders de umbral
document.getElementById('therapeuticSlider').addEventListener('input', (e) => {
    therapeuticThreshold = parseInt(e.target.value);
    document.getElementById('therapeuticValue').textContent = therapeuticThreshold + '%';
    updateThresholds();
});

document.getElementById('sideEffectsSlider').addEventListener('input', (e) => {
    sideEffectsThreshold = parseInt(e.target.value);
    document.getElementById('sideEffectsValue').textContent = sideEffectsThreshold + '%';
    updateThresholds();
});

// Event listener para peso del paciente
document.getElementById('patientWeight').addEventListener('input', (e) => {
    const weight = parseFloat(e.target.value);
    if (weight >= 10 && weight <= 200) {
        patientWeight = weight;
        document.getElementById('weightValue').textContent = weight + ' kg';
        
        // Si el modo auto está activado, calcular y aplicar dosis recomendadas
        if (autoDose && document.getElementById('autoDoseToggle').checked) {
            applyRecommendedDoses(weight);
        }
        
        createChart();
    }
});

// Event listener para toggle de dosis automáticas
document.getElementById('autoDoseToggle').addEventListener('change', (e) => {
    autoDose = e.target.checked;
    if (autoDose) {
        applyRecommendedDoses(patientWeight);
        createChart();
    }
});

// Event listener para dosis vespertina
document.getElementById('rubifenVespertino').addEventListener('change', (e) => {
    rubifenVespertino = e.target.checked;
    createChart();
});

createChart();
