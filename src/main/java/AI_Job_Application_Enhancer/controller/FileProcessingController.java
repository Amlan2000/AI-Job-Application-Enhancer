package AI_Job_Application_Enhancer.controller;

import AI_Job_Application_Enhancer.dto.LLMResponse;
import AI_Job_Application_Enhancer.service.FileParsingService;
import AI_Job_Application_Enhancer.service.GeminiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/file")
@RequiredArgsConstructor
public class FileProcessingController {

    private final FileParsingService fileParsingService;
    private final GeminiService geminiService;

    @PostMapping("/analyze")
    public ResponseEntity<LLMResponse> analyzeResume(@RequestParam("file") MultipartFile file) {
        try {
            // 1. Extract resume text
            String extractedText = fileParsingService.extractText(file);


            // 2. Send to Gemini
            LLMResponse response = geminiService.getLLMResponse(extractedText);

            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new LLMResponse("Failed to process the file."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new LLMResponse("An error occurred while analyzing the resume."));
        }
    }
}
