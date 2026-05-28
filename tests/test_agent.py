import unittest
from unittest.mock import patch

from src.agent.antifraud_agent import answer_question, get_quick_questions
from src.agent.entities import extract_claim_id, extract_limit
from src.agent.router import route, route_intent


class AgentTest(unittest.TestCase):
    def setUp(self):
        self.env_patch = patch.dict("os.environ", {"RASTRO_LLM_ENABLED": "false"}, clear=False)
        self.env_patch.start()

    def tearDown(self):
        self.env_patch.stop()

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
        with patch(
            "src.agent.tools._load_scored",
            side_effect=FileNotFoundError(
                "No se encontró data/processed/siniestros_scored.csv. Ejecuta python -m src.scoring.final_score"
            ),
        ):
            response = answer_question("top 10 casos de mayor riesgo")

        self.assertFalse(response["ok"])
        self.assertEqual(response["intent"], "top_riesgo")
        self.assertIn("data/processed/siniestros_scored.csv", response["hint"])

    def test_agent_routes_pdf_questions(self):
        fake_df = __import__("pandas").DataFrame(
            [
                {
                    "id_siniestro": "SIN-0001",
                    "id_asegurado": "ASEG-1",
                    "id_proveedor": "PROV-1",
                    "ramo": "vehiculos",
                    "ciudad": "Quito",
                    "monto_reclamado": 9000,
                    "suma_asegurada": 10000,
                    "score_final": 90,
                    "nivel_riesgo": "Rojo",
                    "documentos_completos": "No",
                    "dias_desde_inicio_poliza": 5,
                    "accion_sugerida": "Revisar",
                }
            ]
        )
        with patch("src.agent.tools._load_scored", return_value=fake_df):
            response = answer_question("¿Qué asegurados tienen mayor frecuencia de reclamos?")
        self.assertTrue(response["ok"])
        self.assertEqual(response["intent"], "frecuencia_asegurados")

    def test_agent_wraps_tool_success(self):
        with patch("src.agent.tools.get_provider_risk_ranking", return_value=[{"id_proveedor": "PROV-1"}]) as tool:
            response = answer_question("top 3 proveedores")

        tool.assert_called_once_with(limit=3)
        self.assertTrue(response["ok"])
        self.assertEqual(response["intent"], "ranking_proveedores")
        self.assertEqual(response["source"], "tools")
        self.assertEqual(response["data"], [{"id_proveedor": "PROV-1"}])
        self.assertEqual(response["llm"]["status"], "disabled_by_config")
        self.assertEqual(response["llm"]["model"], "gpt-4o")

    def test_agent_uses_llm_message_when_provider_returns_text(self):
        class FakeProvider:
            def generate(self, request):
                from src.agent.llm import LLMResult

                return LLMResult(
                    message="Respuesta ejecutiva generada con evidencia verificada.",
                    provider="openai",
                    model="test-model",
                    status="ok",
                    enabled=True,
                )

        with patch("src.agent.tools.get_provider_risk_ranking", return_value=[{"id_proveedor": "PROV-1"}]), \
             patch("src.agent.antifraud_agent.build_llm_provider", return_value=FakeProvider()):
            response = answer_question("top 3 proveedores")

        self.assertTrue(response["ok"])
        self.assertEqual(response["source"], "llm")
        self.assertIn("Respuesta ejecutiva", response["message"])
        self.assertEqual(response["data"], [{"id_proveedor": "PROV-1"}])
        self.assertEqual(response["llm"]["provider"], "openai")
        self.assertEqual(response["llm"]["status"], "ok")
        self.assertTrue(response["llm"]["enabled"])

    def test_documentation_intent_uses_rag_source(self):
        response = answer_question("¿Qué reglas se usan para calcular el score?")

        self.assertTrue(response["ok"])
        self.assertEqual(response["intent"], "documentacion")
        self.assertEqual(response["source"], "rag")
        self.assertIsInstance(response["data"], list)

    def test_rag_advanced_relevance_and_chunking(self):
        from src.agent.rag import search_docs
        
        # Test query targeting score calculation
        results = search_docs("score final compuesto")
        self.assertIsInstance(results, list)
        self.assertGreater(len(results), 0)
        
        # Verify that all returned snippets are controlled in size and have source path
        for match in results:
            self.assertIn("source", match)
            self.assertIn("snippet", match)
            self.assertLess(len(match["snippet"]), 1000)
            
        # Verify that targeted terms match a high ranking section
        top_snippet = results[0]["snippet"].lower()
        self.assertTrue(any(word in top_snippet for word in ["score", "final", "compuesto"]))

    def test_quick_questions_are_available_for_ui(self):
        questions = get_quick_questions()

        self.assertGreaterEqual(len(questions), 5)
        self.assertTrue(any("proveedores" in question.lower() for question in questions))


if __name__ == "__main__":
    unittest.main()
