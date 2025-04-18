package AI_Job_Application_Enhancer.service;

import AI_Job_Application_Enhancer.dto.LLMResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    @Value("${gemini.api.url}")
    private String geminiApiUrl; // Should already have the key in it as a query param

    private final RestTemplate restTemplate = new RestTemplate();

    public LLMResponse getLLMResponse(String prompt) {
        Map<String, Object> request = new HashMap<>();
        List<Map<String, Object>> contents = new ArrayList<>();

        Map<String, Object> part = new HashMap<>();
        part.put("text", prompt);

        Map<String, Object> content = new HashMap<>();
        content.put("parts", List.of(part));
        contents.add(content);
        request.put("contents", contents);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> httpEntity = new HttpEntity<>(request, headers);

        ResponseEntity<Map> response = restTemplate.postForEntity(geminiApiUrl, httpEntity, Map.class);

        // Extract text from the first candidate's content
        List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.getBody().get("candidates");
        if (candidates != null && !candidates.isEmpty()) {
            Map<String, Object> firstCandidate = candidates.get(0);
            Map<String, Object> firstContent = (Map<String, Object>) firstCandidate.get("content");
            List<Map<String, Object>> parts = (List<Map<String, Object>>) firstContent.get("parts");
            if (parts != null && !parts.isEmpty()) {
                String reply = (String) parts.get(0).get("text");
                return new LLMResponse(reply);
            }
        }

        return new LLMResponse("No response received from Gemini.");
    }
}
