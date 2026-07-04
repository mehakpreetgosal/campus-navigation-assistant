async function sendMessage() {

    const input = document.getElementById("user-input");
    const message = input.value.trim();

    if (message === "") return;

    addUserMessage(message);

    input.value = "";

    try {

        const response = await fetch("/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: message
            })
        });

        const data = await response.json();

        addBotMessage(data.response);

    }
    catch(error) {

        console.error(error);

        addBotMessage(
            "Unable to connect to server."
        );
    }
}

function addUserMessage(message) {

    const chatBox =
        document.getElementById("chat-box");

    chatBox.innerHTML += `
        <div class="user-message">
            ${message}
        </div>
    `;

    chatBox.scrollTop =
        chatBox.scrollHeight;
}

function addBotMessage(message) {

    const chatBox =
        document.getElementById("chat-box");

    chatBox.innerHTML += `
        <div class="bot-message">
            ${message}
        </div>
    `;

    chatBox.scrollTop =
        chatBox.scrollHeight;
}

document.addEventListener(
    "DOMContentLoaded",
    function() {

        const input =
            document.getElementById("user-input");

        if(input){

            input.addEventListener(
                "keypress",
                function(event){

                    if(event.key === "Enter"){

                        sendMessage();

                    }

                }
            );

        }

    }
);