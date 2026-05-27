import unittest
from unittest.mock import patch

from src.agent.antifraud_agent import answer_question, get_quick_questions
from src.agent.entities import extract_claim_id, extract_limit
from src.agent.router import route, route_intent


class AgentTest(unittest.TestCase):
    def test_router_detects_key_intents(self):
        self.assertEqual(route_intent("¿Qué proveedores concentran alertas?"), "ranking_proveedores")
        self.assertEqual(route_intent("Explícame SIN-0045"), "explicar_siniestro")
        self.assertEqual(route_intent("¿Qué narrativas similares tiene SIN-0045?"), "narrativas_similares")
        self.assertEqual(route_intent("¿Qué conexiones de grafo tiene SIN-0045?"), "conexiones_grafo")
        self.assertTrue(route("Qué reglas usan para el score").uses_documentation)

    def test_entity_extraction(self):
        self.assertEqual(extract_claim_id("explica sin_0045"), "SIN-0045")
        self.assertEqual(extract_limit("top 15 casos"), 15)
        self.assertEqual(extract_limit("top 999 casos"), 50)

    def test_missing_claim_id_returns_helpful_error(self):
        response = answer_question("Explícame este siniestro")

        self.assertFalse(response["ok"])
        self.assertEqual(response["intent"], "explicar_siniestro")
        self.assertIn("SIN-0045", response["hint"])

    def test_missing_scored_file_returns_actionable_error(self):
        response = answer_question("top 10 casos de mayor riesgo")

        self.assertFalse(response["ok"])
        self.assertEqual(response["intent"], "top_riesgo")
        self.assertIn("data/processed/siniestros_scored.csv", response["hint"])

    def test_agent_wraps_tool_success(self):
        with patch("src.agent.tools.get_provider_risk_ranking", return_value=[{"id_proveedor": "PROV-1"}]) as tool:
            response = answer_question("top 3 proveedores")

        tool.assert_called_once_with(limit=3)
        self.assertTrue(response["ok"])
        self.assertEqual(response["intent"], "ranking_proveedores")
        self.assertEqual(response["source"], "tools")
        self.assertEqual(response["data"], [{"id_proveedor": "PROV-1"}])

    def test_documentation_intent_uses_rag_source(self):
        response = answer_question("¿Qué reglas se usan para calcular el score?")

        self.assertTrue(response["ok"])
        self.assertEqual(response["intent"], "documentacion")
        self.assertEqual(response["source"], "rag")
        self.assertIsInstance(response["data"], list)

    def test_quick_questions_are_available_for_ui(self):
        questions = get_quick_questions()

        self.assertGreaterEqual(len(questions), 5)
        self.assertTrue(any("proveedores" in question.lower() for question in questions))


if __name__ == "__main__":
    unittest.main()
