export async function onRequestPost(context) {

    const { request, env } = context;

    if (!env.ANTHROPIC_API_KEY) {
        return new Response(JSON.stringify({ error: "ANTHROPIC_API_KEY가 설정되지 않았습니다." }), {
            status: 500,
            headers: { "content-type": "application/json" }
        });
    }

    let body;

    try {
        body = await request.json();
    } catch (err) {
        return new Response(JSON.stringify({ error: "잘못된 요청입니다." }), {
            status: 400,
            headers: { "content-type": "application/json" }
        });
    }

    const cards = Array.isArray(body.cards) ? body.cards.slice(0, 3) : [];

    if (cards.length === 0) {
        return new Response(JSON.stringify({ error: "카드 정보가 없습니다." }), {
            status: 400,
            headers: { "content-type": "application/json" }
        });
    }

    const cardList = cards.map((c, i) => {
        const label = c.label ? `${c.label} — ` : "";
        return `${i + 1}. ${label}${c.name} (기본 의미: ${c.meaning})`;
    }).join("\n");

    const userPrompt = `아래 뽑힌 타로 카드에 대해 각각 2~3문장으로 한국어 해석을 작성해줘. 따뜻하고 통찰력 있는 타로 리더의 말투로, 카드의 기본 의미를 참고하되 그대로 반복하지 말고 좀 더 깊이 있게 풀어서 설명해줘.\n\n${cardList}`;

    const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
            "content-type": "application/json",
            "x-api-key": env.ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
            model: "claude-sonnet-4-6",
            max_tokens: 1024,
            system: "당신은 따뜻하고 통찰력 있는 한국어 타로 리더입니다. 요청받은 카드마다 2~3문장의 간결한 해석을 제공합니다.",
            messages: [{ role: "user", content: userPrompt }],
            output_config: {
                format: {
                    type: "json_schema",
                    schema: {
                        type: "object",
                        properties: {
                            interpretations: {
                                type: "array",
                                items: { type: "string" }
                            }
                        },
                        required: ["interpretations"],
                        additionalProperties: false
                    }
                }
            }
        })
    });

    if (!anthropicResponse.ok) {
        const errText = await anthropicResponse.text();
        return new Response(JSON.stringify({ error: "AI 해석 생성에 실패했습니다.", detail: errText }), {
            status: 502,
            headers: { "content-type": "application/json" }
        });
    }

    const data = await anthropicResponse.json();

    if (data.stop_reason === "refusal") {
        return new Response(JSON.stringify({ error: "AI가 이 요청에 대한 응답을 거부했습니다." }), {
            status: 200,
            headers: { "content-type": "application/json" }
        });
    }

    const textBlock = data.content.find(b => b.type === "text");
    const parsed = JSON.parse(textBlock.text);

    return new Response(JSON.stringify({ interpretations: parsed.interpretations }), {
        status: 200,
        headers: { "content-type": "application/json" }
    });

}
