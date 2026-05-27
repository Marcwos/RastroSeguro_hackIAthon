import unittest

from src.reports.executive_summary import build_executive_report
from src.reports.markdown_report import render_markdown_report
from src.reports.sections import aggregate_by_field, exposed_amount, risk_counts, top_claims


class ReportsTest(unittest.TestCase):
    def claims(self):
        return [
            {
                "id_siniestro": "SIN-001",
                "ramo": "vehiculos",
                "ciudad": "Quito",
                "id_proveedor": "PROV-A",
                "score_final": 92,
                "nivel_riesgo": "Rojo",
                "monto_reclamado": 10000,
                "accion_sugerida": "Escalar.",
            },
            {
                "id_siniestro": "SIN-002",
                "ramo": "salud",
                "ciudad": "Quito",
                "id_proveedor": "PROV-A",
                "score_final": 70,
                "nivel_riesgo": "Amarillo",
                "monto_reclamado": 3000,
                "accion_sugerida": "Revisar.",
            },
            {
                "id_siniestro": "SIN-003",
                "ramo": "hogar",
                "ciudad": "Cuenca",
                "id_proveedor": "PROV-B",
                "score_final": 30,
                "nivel_riesgo": "Verde",
                "monto_reclamado": 1500,
                "accion_sugerida": "Continuar.",
            },
        ]

    def test_sections_summarize_claims(self):
        claims = self.claims()

        self.assertEqual(risk_counts(claims), {"Verde": 1, "Amarillo": 1, "Rojo": 1})
        self.assertEqual(top_claims(claims, limit=1)[0]["id_siniestro"], "SIN-001")
        self.assertEqual(exposed_amount(claims, "Rojo"), 10000)
        self.assertEqual(aggregate_by_field(claims, "id_proveedor")[0]["id_proveedor"], "PROV-A")

    def test_build_executive_report_contract(self):
        report = build_executive_report(self.claims(), top_limit=2)

        self.assertEqual(report["summary"]["total_siniestros"], 3)
        self.assertEqual(report["summary"]["casos_rojos"], 1)
        self.assertEqual(len(report["top_casos"]), 2)
        self.assertIn("ethics_note", report)
        self.assertIn("top_proveedores", report)

    def test_render_markdown_report_contains_demo_sections(self):
        markdown = render_markdown_report(build_executive_report(self.claims()))

        self.assertIn("# Reporte ejecutivo", markdown)
        self.assertIn("## Top casos críticos", markdown)
        self.assertIn("## Nota ética", markdown)
        self.assertIn("SIN-001", markdown)
        self.assertIn("no acusa fraude", markdown.lower())


if __name__ == "__main__":
    unittest.main()
