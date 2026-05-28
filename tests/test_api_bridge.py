import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient

from api.main import create_app


class ApiBridgeTest(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(create_app())

    def test_healthcheck_uses_standard_envelope(self):
        response = self.client.get("/api/health")

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertTrue(payload["ok"])
        self.assertEqual(payload["data"]["service"], "rastroseguro-api")
        self.assertIsNone(payload["error"])

    def test_claims_endpoint_wraps_tool_data(self):
        with patch("api.routes.claims.tools.get_top_risky_claims", return_value=[{"id_siniestro": "SIN-1"}]) as tool:
            response = self.client.get("/api/claims?limit=5")

        tool.assert_called_once_with(limit=5)
        payload = response.json()
        self.assertTrue(payload["ok"])
        self.assertEqual(payload["data"], [{"id_siniestro": "SIN-1"}])

    def test_missing_scored_file_becomes_actionable_error(self):
        with patch("api.routes.claims.tools.get_top_risky_claims", side_effect=FileNotFoundError("missing csv")):
            response = self.client.get("/api/claims")

        self.assertEqual(response.status_code, 404)
        payload = response.json()
        self.assertFalse(payload["ok"])
        self.assertIsNone(payload["data"])
        self.assertIn("missing csv", payload["error"]["message"])
        self.assertIn("scoring", payload["error"]["hint"])

    def test_explanation_endpoint_calls_explain_claim(self):
        with patch("api.routes.claims.explain_claim", return_value={"id_siniestro": "SIN-9", "score_final": 88}) as explain:
            response = self.client.get("/api/claims/SIN-9/explanation")

        explain.assert_called_once_with("SIN-9")
        self.assertTrue(response.json()["ok"])
        self.assertEqual(response.json()["data"]["score_final"], 88)


    def test_dossier_endpoint_calls_tool(self):
        with patch("api.routes.claims.tools.get_claim_dossier", return_value={"id_siniestro": "SIN-9", "headline": "Expediente"}) as tool:
            response = self.client.get("/api/claims/SIN-9/dossier")

        tool.assert_called_once_with("SIN-9")
        payload = response.json()
        self.assertTrue(payload["ok"])
        self.assertEqual(payload["data"]["headline"], "Expediente")

    def test_star_cases_endpoint_calls_tool(self):
        with patch("api.routes.reports.tools.get_demo_star_cases", return_value={"count": 1, "cases": []}) as tool:
            response = self.client.get("/api/reports/star-cases")

        tool.assert_called_once_with()
        payload = response.json()
        self.assertTrue(payload["ok"])
        self.assertEqual(payload["data"]["count"], 1)

    def test_business_impact_endpoint_accepts_review_percent(self):
        with patch("api.routes.reports.tools.get_business_impact", return_value={"mensaje": "exposición"}) as tool:
            response = self.client.get("/api/reports/business-impact?review_percent=0.2")

        tool.assert_called_once_with(review_percent=0.2)
        payload = response.json()
        self.assertTrue(payload["ok"])
        self.assertIn("exposición", payload["data"]["mensaje"])

    def test_simulator_endpoint_accepts_direct_claim_payload(self):
        simulated = {"ok": True, "simulated": True, "risk": {"nivel_riesgo": "Rojo"}}
        with patch("api.routes.simulator.simulate_new_claim", return_value=simulated) as simulate:
            response = self.client.post("/api/simulator/claim", json={"ramo": "vehiculo"})

        simulate.assert_called_once_with({"ramo": "vehiculo"})
        payload = response.json()
        self.assertTrue(payload["ok"])
        self.assertTrue(payload["data"]["simulated"])

    def test_agent_endpoint_wraps_success_response(self):
        agent_response = {"ok": True, "message": "Respuesta", "source": "tools"}
        with patch("api.routes.agent.answer_question", return_value=agent_response) as answer:
            response = self.client.post("/api/agent/ask", json={"question": "top casos"})

        answer.assert_called_once_with("top casos")
        payload = response.json()
        self.assertTrue(payload["ok"])
        self.assertEqual(payload["data"]["message"], "Respuesta")

    def test_agent_domain_error_becomes_api_error_with_details(self):
        agent_response = {"ok": False, "message": "Falta id", "hint": "Usa SIN-0045"}
        with patch("api.routes.agent.answer_question", return_value=agent_response):
            response = self.client.post("/api/agent/ask", json={"question": "explica"})

        self.assertEqual(response.status_code, 400)
        payload = response.json()
        self.assertFalse(payload["ok"])
        self.assertEqual(payload["error"]["hint"], "Usa SIN-0045")
        self.assertEqual(payload["error"]["details"], agent_response)

    def test_report_endpoint_supports_markdown(self):
        with patch("api.routes.reports.generate_report_markdown", return_value="# Reporte") as report:
            response = self.client.get("/api/report?format=markdown&top_limit=3")

        report.assert_called_once_with(top_limit=3)
        payload = response.json()
        self.assertTrue(payload["ok"])
        self.assertEqual(payload["data"]["format"], "markdown")
        self.assertEqual(payload["data"]["content"], "# Reporte")

    def test_validation_errors_use_standard_envelope(self):
        response = self.client.post("/api/agent/ask", json={"question": ""})

        self.assertEqual(response.status_code, 422)
        payload = response.json()
        self.assertFalse(payload["ok"])
        self.assertIn("contrato", payload["error"]["message"])


if __name__ == "__main__":
    unittest.main()
