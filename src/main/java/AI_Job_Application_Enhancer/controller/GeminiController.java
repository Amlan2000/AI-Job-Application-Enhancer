package AI_Job_Application_Enhancer.controller;

import AI_Job_Application_Enhancer.dto.LLMResponse;
import AI_Job_Application_Enhancer.dto.PromptRequest;
import AI_Job_Application_Enhancer.service.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/llm")
public class GeminiController {

    @Autowired
    private GeminiService geminiService;

    @PostMapping("/chat")
    public LLMResponse chat(@RequestBody PromptRequest request) {
        return geminiService.getLLMResponse(request.getPrompt());
    }
}
