# Presentación ejecutiva

## Contenido

- [`pitch.md`](./pitch.md) — Pitch completo (~10 min) listo para exportar

## Exportar a PDF

### Opción 1: Python (recomendado, sin dependencias externas)

```bash
pip install fpdf2
py -3 scripts/export_pitch_pdf.py
```

Salida: `presentation/pitch.pdf`

### Opción 2: Pandoc

```powershell
.\scripts\export_pitch_pdf.ps1
```

Requisito: [Pandoc](https://pandoc.org/installing.html) instalado.

### Opción 3: VS Code / Cursor

1. Abrir `presentation/pitch.md`
2. Vista previa Markdown → Imprimir → Guardar como PDF
3. Guardar como `presentation/pitch.pdf`

### Opción 3: GitHub

Subir `pitch.md` al repo; GitHub renderiza Markdown. Para entrega formal, preferir PDF.

## Entregable esperado

`presentation/pitch.pdf` — Problema, solución, impacto y próximos pasos (PDF §14).
