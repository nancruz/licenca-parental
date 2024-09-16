const motherMandatoryDays = 42;
const fatherMandatoryDays = 28;
let totalDaysAllowed = 120;
let totalDaysUsed = 0;
let calendar;
let dueDate;

document.addEventListener("DOMContentLoaded", () => {
    // Função para adicionar um bloco de dias
    function addBlock(parentType) {
        const blockContainer = document.getElementById(`${parentType}Blocks`);
        const blockId = `block-${parentType}-${
            blockContainer.children.length + 1
        }`;

        const blockHtml = `
            <div id="${blockId}" class="flex items-center space-x-2">
                <input type="date" class="startDate block p-2 border border-gray-300 rounded-md" required>
                <input type="number" class="numberDays block w-20 p-2 border border-gray-300 rounded-md" placeholder="Dias" min="1" required>
                <button type="button" class="addBlock bg-blue-500 text-white px-4 py-2 rounded" onclick="addBlockDates('${blockId}')">Adicionar</button>
            </div>
        `;
        blockContainer.insertAdjacentHTML("beforeend", blockHtml);
    }

    // Adicionar blocos para a mãe e o pai
    document
        .getElementById("addMotherBlock")
        .addEventListener("click", () => addBlock("mother"));
    document
        .getElementById("addFatherBlock")
        .addEventListener("click", () => addBlock("father"));
    document
        .getElementById("addFatherMandatoryBlock")
        .addEventListener("click", () => addBlock("fatherMandatory"));

    // Resetar o formulário
    document.getElementById("resetBtn").addEventListener("click", function () {
        document.getElementById("parentalForm").reset();
        document.getElementById("motherBlocks").innerHTML = "";
        document.getElementById("fatherBlocks").innerHTML = "";
        document.getElementById("fatherMandatoryBlocks").innerHTML = "";
        document.getElementById("result").innerHTML = "";
        totalDaysUsed = 0;
        totalDaysAllowed = 120;
        updateRemainingDays();
        calendar.getEvents().forEach((event) => event.remove());
    });

    // Iniciar o calendário
    const calendarEl = document.getElementById("calendar");
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: "dayGridMonth",
        locale: "pt",
        height: 600,
    });
    calendar.render();
});
// Função para calcular datas
function calculateTotalDays(startDate, days) {
    let resultDate = new Date(startDate);
    resultDate.setDate(resultDate.getDate() + parseInt(days));
    return resultDate;
}

// Função para criar eventos no calendário
function addEventToCalendar(title, startDate, endDate, color) {
    return calendar.addEvent({
        id: Date.now(),
        title: title,
        start: startDate,
        end: endDate,
        color: color,
    });
}

function onChangeDueDate(date) {
    const motherStartDate = new Date(date);
    const motherEndDate = calculateTotalDays(
        motherStartDate,
        motherMandatoryDays
    );
    document.getElementById("motherStartDate").textContent =
        motherStartDate.toDateString();
    document.getElementById("motherEndDate").textContent =
        motherEndDate.toDateString();
    addEventToCalendar(
        "Mãe (Obrigatórios)",
        motherStartDate,
        motherEndDate,
        "green"
    );
    if (!dueDate) {
        totalDaysUsed += motherMandatoryDays;
        dueDate = motherStartDate;
        updateRemainingDays();
    }
}

// Adds dates from the blocks to the calendar
function addBlockDates(blockId) {
    const numberDays = document
        .getElementById(blockId)
        .querySelector(".numberDays").value;
    const startDate = new Date(
        document.getElementById(blockId).querySelector(".startDate").value
    );
    const endDate = new Date(calculateTotalDays(startDate, numberDays));

    let label;
    let color;

    if (blockId.includes("mother")) {
        label = "Mãe";
        color = "green";
    } else if (blockId.includes("fatherMandatory")) {
        label = "Pai (Obrigatórios)";
        color = "blue";
    } else {
        label = "Pai";
        color = "blue";
    }

    // Adds to the calendar
    const eventObj = addEventToCalendar(label, startDate, endDate, color);

    // Remove Add button and update the block info
    const blockElem = document.getElementById(`${blockId}`);
    blockElem.querySelector(".addBlock").remove();
    blockElem.querySelector(".startDate").remove();
    blockElem.querySelector(".numberDays").remove();
    const datesElem = `
        <p><strong>Início:</strong> ${startDate.toDateString()}</p>
        <p><strong>Fim:</strong> ${endDate.toDateString()}</p>
        <p><strong>Dias:</strong> ${numberDays}</p>
        <button type="button" class="removeBlock bg-red-500 text-white px-4 py-2 rounded" onclick="removeBlockDates('${blockId}','${
        eventObj.id
    }', ${parseInt(numberDays)})">Remover</button>
    `;
    blockElem.insertAdjacentHTML("afterbegin", datesElem);

    if (!blockId.includes("fatherMandatory")) {
        // update remaining days
        totalDaysUsed += parseInt(numberDays);
        updateRemainingDays();
    }
}

function removeBlockDates(blockId, eventObjId, numberDays) {
    calendar.getEventById(eventObjId).remove();
    document.getElementById(blockId).remove();

    if (!blockId.includes("fatherMandatory")) {
        // update remaining days
        totalDaysUsed -= parseInt(numberDays);
        updateRemainingDays();
    }
}

function onChangeTotalDays() {
    totalDaysAllowed = document.getElementById("parentalOption").value;
    updateRemainingDays();
}

function updateRemainingDays() {
    const remainingDaysEl = document.getElementById("remainingDays");
    const remainingDays = totalDaysAllowed - totalDaysUsed;

    remainingDaysEl.textContent = `${remainingDays} dias.`;
}
