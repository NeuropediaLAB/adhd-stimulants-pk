# Comparador de Farmacocinética - Estimulantes TDAH

Herramienta web interactiva para comparar gráficamente los perfiles farmacocinéticos de diferentes medicamentos estimulantes utilizados en el tratamiento del TDAH.

## 🎯 Características

- **Comparación visual**: Curvas de concentración plasmática vs tiempo con unidades mg/kg
- **5 formulaciones**: Metilfenidato (LI, LM 50:50, LM 30:70, OROS 22:78) y Lisdexanfetamina
- **Modelos PK avanzados**: 
  - Sistema OROS con liberación osmótica continua (12h)
  - Saturación enzimática Michaelis-Menten para lisdexanfetamina
- **Ajuste por peso**: Cálculo automático de dosis según peso del paciente (0.5 mg/kg)
- **Dosis vespertina**: Opción de añadir dosis de rescate con Rubifen IR
- **Umbrales personalizables**: Ajusta niveles terapéuticos y efectos secundarios
- **Responsive**: Funciona en desktop y móvil

## 🚀 Uso

### Con Docker (Recomendado)
```bash
# Construir la imagen
docker build -t adhd-stimulants-pk .

# Ejecutar el contenedor
docker run -d -p 8080:80 --name adhd-pk adhd-stimulants-pk

# Acceder a la aplicación
# Abre http://localhost:8080 en tu navegador
```

### Con Docker Compose
```bash
docker-compose up -d
```

### Sin Docker
Simplemente abre el archivo `index.html` en tu navegador web.

## 📊 Medicamentos Incluidos

1. **Metilfenidato LI (Rubifen®)**: Liberación inmediata, duración 3-4h
2. **Metilfenidato 50:50 (Medikinet®, Rubifen Prolong®)**: 50% LI + 50% MR, duración ~8h
3. **Metilfenidato 30:70 (Equasym®)**: 30% LI + 70% MR, duración ~8h
4. **Metilfenidato OROS 22:78 (Concerta®, Atenza®, Rubicrono®)**: Sistema osmótico, duración 8-12h
5. **Lisdexanfetamina (Elvanse®)**: Profármaco con saturación enzimática, duración 12-13h

### Diferencias clave entre formulaciones:
- **50:50 y 30:70**: Sistemas bimodales con liberación inmediata + retardada
- **OROS 22:78**: Liberación osmótica continua, curva más plana y prolongada
- **Lisdexanfetamina**: Conversión enzimática limitada (Michaelis-Menten) → efecto sostenido sin picos

## 🔬 Modelo Farmacocinético

La aplicación utiliza modelos farmacocinéticos específicos:

### Metilfenidato
- **Liberación Inmediata (Rubifen)**: Modelo monocompartimental con absorción y eliminación de primer orden
- **Liberación Modificada Bimodal (Medikinet 50:50, Equasym 30:70)**: Dos fases de liberación (IR + retardada)
- **Sistema OROS (Concerta, Atenza, Rubicrono)**: 
  - 22% liberación inmediata 
  - 78% liberación osmótica continua durante 12h
  - Simula el efecto prolongado del sistema de bomba osmótica

### Lisdexanfetamina (Elvanse)
- **Modelo de saturación enzimática (Michaelis-Menten)**:
  - Absorción rápida del profármaco
  - Conversión enzimática limitada por saturación en eritrocitos
  - Este mecanismo fundamenta su efecto prolongado (12-13h)
  - Previene picos plasmáticos abruptos y reduce potencial de abuso

## 📝 Notas

- **Unidades**: Las concentraciones se expresan en mg/kg equivalente de metilfenidato IR
- **Equivalencia lisdexanfetamina**: 1 mg lisdexanfetamina ≈ 2 mg metilfenidato
- **Dosis recomendada**: 0.5 mg/kg de metilfenidato IR (ajustable según formulación)
- **Correcciones recientes (2026)**:
  - Sistema OROS: duración de liberación extendida de 10h → 12h
  - Lisdexanfetamina: implementación de modelo Michaelis-Menten con saturación enzimática
- Esta herramienta es educativa, **no sustituye criterio médico**

## 🔍 Referencias Bibliográficas

- Banaschewski T et al. Eur Child Adolesc Psychiatry 2006
- Nottinghamshire APC Methylphenidate Switching Protocol
- Modelo farmacocinético: Absorción/eliminación primer orden + saturación enzimática

## 🛠️ Tecnologías

- HTML5 / CSS3
- JavaScript (ES6+)
- Chart.js 4.4.1

## 📄 Licencia

Uso libre para fines educativos y clínicos.
