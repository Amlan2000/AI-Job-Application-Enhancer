package AI_Job_Application_Enhancer.service;

import AI_Job_Application_Enhancer.Constants.Prompts;
import AI_Job_Application_Enhancer.dto.LLMResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public LLMResponse getLLMResponse(String resumeText) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> userPart = Map.of("text", "Here is my resume:\n\n" + resumeText);
        Map<String, Object> userContent = Map.of("role", "user", "parts", List.of(userPart));

        Map<String, Object> assistantPart = Map.of("text", Prompts.RESUME_FEEDBACK_PROMPT);
        Map<String, Object> assistantContent = Map.of("role", "assistant", "parts", List.of(assistantPart));

        Map<String, Object> requestBody = Map.of("contents", List.of(userContent, assistantContent));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<Map> response = restTemplate.exchange(
                geminiApiUrl,
                HttpMethod.POST,
                entity,
                Map.class
        );

        List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.getBody().get("candidates");
        if (candidates != null && !candidates.isEmpty()) {
            Map<String, Object> firstCandidate = candidates.get(0);
            Map<String, Object> content = (Map<String, Object>) firstCandidate.get("content");
            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
            if (parts != null && !parts.isEmpty()) {
                String reply = (String) parts.get(0).get("text");
                return new LLMResponse(reply);
            }
        }

        return new LLMResponse("Sorry, I couldn't generate suggestions at the moment.");
    }
}