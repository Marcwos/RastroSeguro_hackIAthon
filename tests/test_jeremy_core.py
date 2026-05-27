import unittest

from src.rules.rule_registry import evaluate_rules, rules_score
from src.scoring.final_score import compute_final_score, score_claim
from src.simulator.simulate_claim import simulate_new_claim


def risky_vehicle_claim():
    return {
        "id_siniestro": "SIN-TEST-001",
        "ramo": "vehiculos",
        "cobertura": "robo total",
        "tipo_evento": "robo total",
        "fecha_inicio_poliza": "2026-01-01",
        "fecha_fin_poliza": "2026-12-31",
        "fecha_ocurrencia": "2026-01-03",
        "fecha_reporte": "2026-01-12",
        "monto_reclamado": 19500,
        "suma_asegurada": 20000,
        "documentos_completos": False,
        "documentos_inconsistentes": True,
        "historial_siniestros_asegurado": 3,
        "historial_siniestros_vehiculo": 3,
        "ocurrio_noche": True,
        "hay_testigos": False,
        "reporte_policial": False,
        "tercero_identificado": False,
        "conductor_recurrente": True,
    }


class JeremyCoreTest(unittest.TestCase):
    def test_rules_emit_traceable_alerts(self):
        results = evaluate_rules(risky_vehicle_claim())
        codes = {result.code for result in results}

        self.assertIn("RB-001", codes)
        self.assertIn("RB-007", codes)
        self.assertIn("RV-001", codes)
        self.assertTrue(all(result.message for result in results))
        self.assertTrue(all(isinstance(result.evidence, dict) for result in results))
        self.assertGreater(rules_score(results), 70)

    def test_score_claim_outputs_contract_fields(self):
        scored = score_claim(risky_vehicle_claim())

        self.assertGreaterEqual(scored["score_final"], 0)
        self.assertLessEqual(scored["score_final"], 100)
        self.assertEqual(scored["nivel_riesgo"], "Rojo")
        self.assertTrue(scored["alertas_activadas"])
        self.assertIn("priorización", scored["explicacion"])
        self.assertIn("score_reglas", scored)
        self.assertIn("accion_sugerida", scored)

    def test_final_score_uses_neutral_missing_components(self):
        score = compute_final_score({"score_reglas": 100})
        # 30 from rules + 70% of neutral 50 = 65
        self.assertEqual(score, 65)

    def test_simulator_reuses_scoring_engine(self):
        result = simulate_new_claim(risky_vehicle_claim())

        self.assertEqual(result["id_siniestro"], "SIN-TEST-001")
        self.assertEqual(result["nivel_riesgo"], "Rojo")
        self.assertTrue(result["alertas"])
        self.assertGreater(result["componentes_score"]["reglas"], 70)


if __name__ == "__main__":
    unittest.main()
