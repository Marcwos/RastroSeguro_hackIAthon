# Instrucciones de ejecución

Este documento define el camino esperado para correr RastroSeguro de punta a punta.

## Instalación

```bash
pip install -r requirements.txt
```

## Flujo completo esperado

### 1. Generar dataset sintético

```bash
python -m src.data.generate_synthetic_data
```

Salida esperada:

```txt
data/synthetic/siniestros.csv
```

### 2. Entrenar modelos

```bash
python -m src.models.train_classifier
python -m src.models.train_anomaly
```

Salidas esperadas:

```txt
models/fraud_classifier.joblib
models/anomaly_detector.joblib
```

### 3. Calcular scoring

```bash
python -m src.scoring.final_score
```

Salida esperada:

```txt
data/processed/siniestros_scored.csv
```

### 4. Ejecutar app

```bash
streamlit run app/main.py
```

## Verificación rápida

Antes de integrar cambios, confirmar:

- [ ] Existe `data/synthetic/siniestros.csv`.
- [ ] Existe `data/processed/siniestros_scored.csv`.
- [ ] `score_final` está entre 0 y 100.
- [ ] `nivel_riesgo` contiene Verde, Amarillo o Rojo.
- [ ] Las alertas son explicables.
- [ ] La app carga sin errores.
- [ ] No se subieron credenciales ni datos reales.
