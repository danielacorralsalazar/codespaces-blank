// AHORA JS // ====================================================================
// --- DATA: Lubrication Tasks (25 Asset IDs) ---
// ====================================================================

// Function to load data from Local Storage or use default data
function loadInitialData() {
    const storedData = localStorage.getItem('lubricationData');
    if (storedData) {
        try {
            const data = JSON.parse(storedData);
            for (const assetId in data) {
                if (typeof data[assetId].lubricationMapUrl === 'undefined') {
                    data[assetId].lubricationMapUrl = null;
                }
                data[assetId].tasks.forEach(task => { 
                    if (typeof task.skipCount === 'undefined') {
                        task.skipCount = 0;
                    }
                });
            }
            return data;
        } catch (e) {
            console.error("Error parsing stored data, using default.", e);
        }
    }
    
    // Default Data Structure: (NUEVA ESTRUCTURA)
    return {
        // ROW 1: Wet End & Material Prep (6 Assets)
        "unwind-section": {
            tasks: [
                { text: "Grease Unwind Roller Bearings", frequency: "7D", lastCompleted: null, completed: false, scheduleStartDay: 0, hoursSpent: null, skipCount: 0 }, 
                { text: "Check Tensioner Oil Level", frequency: "1M", lastCompleted: null, completed: false, scheduleStartDay: 0, hoursSpent: null, skipCount: 0 },
                { text: "Major Overhaul - Tech A (Annual Day 45)", frequency: "1Y", lastCompleted: null, completed: false, scheduleStartDay: 45, hoursSpent: null, skipCount: 0 }
            ],
            // 🔑 Por defecto en null. El usuario lo añadirá desde la interfaz.
            lubricationMapUrl: null
        },
        "splice-section": { tasks: [], lubricationMapUrl: null }, 
        "dml-section": { tasks: [], lubricationMapUrl: null },
        "coater-section": { 
            tasks: [
                { text: "Check Coating Head Oil Bath", frequency: "1D", lastCompleted: null, completed: false, scheduleStartDay: 0, hoursSpent: null, skipCount: 0 }
            ],
            lubricationMapUrl: null
        },
        "surge-tank-system": { tasks: [], lubricationMapUrl: null },
        "filler-system": { tasks: [], lubricationMapUrl: null },

        // ROW 2: Granule, Blender, & Cooling (4 Assets)
        "blender-section": {
            tasks: [
                { text: "Grease Blender Motor Bearings", frequency: "1M", lastCompleted: null, completed: false, scheduleStartDay: 0, hoursSpent: null, skipCount: 0 },
                { text: "Major Overhaul - Tech B (Annual Day 180)", frequency: "1Y", lastCompleted: null, completed: false, scheduleStartDay: 180, hoursSpent: null, skipCount: 0 }
            ],
            lubricationMapUrl: null
        },
        "granule-section": {
            tasks: [
                { text: "Inspect Granule Conveyor Chains", frequency: "14D", lastCompleted: null, completed: false, scheduleStartDay: 0, hoursSpent: null, skipCount: 0 }
            ],
            lubricationMapUrl: null
        },
        "cooling-section": {
            tasks: [
                { text: "Check Cooling Drum Water Glycol", frequency: "7D", lastCompleted: null, completed: false, scheduleStartDay: 0, hoursSpent: null, skipCount: 0 }
            ],
            lubricationMapUrl: null
        },
        "fpl-section": {
            tasks: [
                { text: "Lube FPL Roller Guides", frequency: "1D", lastCompleted: null, completed: false, scheduleStartDay: 0, hoursSpent: null, skipCount: 0 }
            ],
            lubricationMapUrl: null
        },

        // ... Resto de las secciones
        "sealant-carry-over": { tasks: [], lubricationMapUrl: null },
        "run-tank-sealant": { tasks: [], lubricationMapUrl: null },
        "pattern-cutter": {
            tasks: [
                { text: "Grease Cutter Head Mechanism", frequency: "7D", lastCompleted: null, completed: false, scheduleStartDay: 0, hoursSpent: null, skipCount: 0 }
            ],
            lubricationMapUrl: null
        },
        "laminator-section": { tasks: [], lubricationMapUrl: null },
        "run-tank-adhesive": { tasks: [], lubricationMapUrl: null },
        "chop-cutter": {
            tasks: [
                { text: "Check Chopper Blade Oil", frequency: "1D", lastCompleted: null, completed: false, scheduleStartDay: 0, hoursSpent: null, skipCount: 0 }
            ],
            lubricationMapUrl: null
        },
        "delivery-section": { tasks: [], lubricationMapUrl: null },
        "catchers": { tasks: [], lubricationMapUrl: null },
        "asphalt-yard": {
            tasks: [
                { text: "Inspect Asphalt Pump Motors", frequency: "1M", lastCompleted: null, completed: false, scheduleStartDay: 0, hoursSpent: null, skipCount: 0 }
            ],
            lubricationMapUrl: null
        },
        "palletizer-1-north": {
            tasks: [
                { text: "Grease Palletizer Lift Chains", frequency: "7D", lastCompleted: null, completed: false, scheduleStartDay: 0, hoursSpent: null, skipCount: 0 }
            ],
            lubricationMapUrl: null
        },
        "wrapper-1": {
            tasks: [
                { text: "Lube Wrapper Film Guides", frequency: "1D", lastCompleted: null, completed: false, scheduleStartDay: 0, hoursSpent: null, skipCount: 0 }
            ],
            lubricationMapUrl: null
        },
        "wrapper-1-entry": { tasks: [], lubricationMapUrl: null },
        "palletizer-2": {
            tasks: [
                { text: "Check Palletizer 2 Hydraulic Fluid", frequency: "1M", lastCompleted: null, completed: false, scheduleStartDay: 0, hoursSpent: null, skipCount: 0 }
            ],
            lubricationMapUrl: null
        },
        "wrapper-2": { tasks: [], lubricationMapUrl: null },
        "wrapper-2-entry": { tasks: [], lubricationMapUrl: null }
    };
}

let lubricationData = loadInitialData();
let currentAssetId = '';
// Fecha de demostración: HOY es 2025-11-23
let today = new Date("2025-11-23"); 
let overallChartInstance = null;
const ONE_DAY_MS = 1000 * 60 * 60 * 24;

// ====================================================================
// --- UTILITY FUNCTIONS ---
// ====================================================================

function saveData() {
    localStorage.setItem('lubricationData', JSON.stringify(lubricationData));
}

// 🔑 NUEVA FUNCIÓN: Convierte el enlace compartido de Google Drive a enlace de descarga directa.
function convertDriveLinkToDirect(sharedLink) {
    // Regex para encontrar el ID en formatos como /file/d/ID/view o /open?id=ID
    const regex = /(?:https?:\/\/)?drive\.google\.com\/(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]+)/;
    const match = sharedLink.match(regex);
    
    if (match && match[1]) {
        const fileId = match[1];
        // Formato de descarga directa (uc?export=view)
        return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }
    return null; 
}


function getDayOfYear(date) {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start;
    return Math.floor(diff / ONE_DAY_MS);
}

function calculateNextDueDate(lastCompleted, frequency, startDayOfYear = 0) {
    const today = new Date("2025-11-23");

    // 1. Manejo de Frecuencias Simples (X D/W/M)
    if (startDayOfYear === 0 || frequency.slice(-1) !== 'Y') {
        let date = lastCompleted ? new Date(lastCompleted) : today;
        const num = parseInt(frequency.slice(0, -1));
        const unit = frequency.slice(-1);

        switch (unit) {
            case 'D': date.setDate(date.getDate() + num); break;
            case 'W': date.setDate(date.getDate() + num * 7); break;
            case 'M': date.setMonth(date.getMonth() + num); break;
            case 'Y': date.setFullYear(date.getFullYear() + num); break;
        }
        
        if (!lastCompleted && date < today) {
             return today;
        }

        return date;
    } 
    
    // 2. Manejo de Frecuencias Anuales Fijas (Fixed Annual Day - scheduleStartDay > 0)
    let targetYear = today.getFullYear();
    let nextDueDate = new Date(targetYear, 0, startDayOfYear);

    if (nextDueDate < today) {
        targetYear++;
        nextDueDate = new Date(targetYear, 0, startDayOfYear);
    }

    if (lastCompleted) {
        const lastDate = new Date(lastCompleted);
        const lastActionYear = lastDate.getFullYear();
        
        if (lastActionYear >= targetYear) {
            targetYear = lastActionYear + 1;
            nextDueDate = new Date(targetYear, 0, startDayOfYear);
        }
    }
    
    return nextDueDate;
}

/**
 * Verifica si la tarea está PENDIENTE (Dentro de la ventana de 7 días) o VENCIDA (Overdue).
 */
function isTaskDueTodayOrPending(nextDueDate) {
    const todayMs = today.getTime();
    const nextDueDateMs = nextDueDate.getTime();
    
    // Define la Ventana de Cumplimiento: 7 días antes de la fecha programada.
    const complianceWindowStartMs = nextDueDateMs - (7 * ONE_DAY_MS);

    // La tarea está dentro del rango de acción si hoy es igual o posterior al inicio de la ventana.
    return todayMs >= complianceWindowStartMs;
}

/**
 * Verifica si la tarea está estrictamente VENCIDA (OVERDUE).
 */
function isTaskStrictlyOverdue(nextDueDate) {
    const todayMs = today.getTime();
    const nextDueDateMs = nextDueDate.getTime();
    
    return todayMs > nextDueDateMs;
}

// Formats the date to YYYY-MM-DD
function formatDate(date) {
    if (!(date instanceof Date) || isNaN(date)) return '';
    return date.toISOString().split('T')[0];
}

// ====================================================================
// --- UI AND MODAL MANAGEMENT (RESTORED) ---
// ====================================================================

function openTaskModal(assetId) {
    currentAssetId = assetId;
    const assetBlock = document.getElementById(assetId);
    const assetName = assetBlock.firstChild.textContent.trim().split('\n')[0]; 

    document.getElementById('modal-title').textContent = `Lubrication Tasks - ${assetName}`; 
    document.getElementById('currentAssetId').value = assetId;
    renderTaskList(assetId);
    document.getElementById('taskModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('taskModal').style.display = 'none';
    updateAssetProgress(currentAssetId); 
    updateOverallProgressChart();
    currentAssetId = '';
}


function openAddTaskModal() {
    document.getElementById('taskModal').style.display = 'none';
    
    const assetBlock = document.getElementById(currentAssetId);
    const assetName = assetBlock.firstChild.textContent.trim().split('\n')[0]; 
    document.getElementById('addTaskModalTitle').textContent = `Add New Task to ${assetName}`;
    document.getElementById('addTaskAssetId').value = currentAssetId;
    
    document.getElementById('addTaskModal').style.display = 'block';
}

function closeAddTaskModal() {
    document.getElementById('addTaskModal').style.display = 'none';
    
    // Limpiar campos
    document.getElementById('newTaskText').value = '';
    document.getElementById('newTaskFrequency').value = '1D';
    document.getElementById('newTaskStartDay').value = '0';
    document.getElementById('newTaskStartDayGroup').style.display = 'none'; 
    
    // Restaurar el modal principal
    document.getElementById('taskModal').style.display = 'block';
}

function openEditModal(assetId, index) {
    const task = lubricationData[assetId].tasks[index]; 
    
    document.getElementById('edit-modal-title').textContent = task.text;
    document.getElementById('editTaskText').value = task.text;
    document.getElementById('editTaskFrequency').value = task.frequency;
    document.getElementById('editLastCompleted').value = task.lastCompleted || '';
    
    document.getElementById('editStartDayGroup').style.display = task.frequency.slice(-1) === 'Y' ? 'block' : 'none';
    document.getElementById('editStartDay').value = task.scheduleStartDay || 0;
    
    document.getElementById('editCurrentAssetId').value = assetId;
    document.getElementById('editCurrentTaskIndex').value = index;

    document.getElementById('taskModal').style.display = 'none';
    document.getElementById('editTaskModal').style.display = 'block';
}

function closeEditModal() {
    document.getElementById('editTaskModal').style.display = 'none';
    document.getElementById('taskModal').style.display = 'block';
}

// 🔑 ACTUALIZADO: openImageModal para manejar la administración
function openImageModal(assetId) {
    const assetData = lubricationData[assetId];
    const assetBlock = document.getElementById(assetId);
    const assetName = assetBlock.firstChild.textContent.trim().split('\n')[0];

    document.getElementById('currentImageAssetId').value = assetId; // Guarda el ID del activo
    document.getElementById('image-modal-title').textContent = `${assetName} - Lubrication Points Map`;
    
    const imageElement = document.getElementById('assetLubricationImage');
    const noImageMsg = document.getElementById('noImageMessage');
    const imageLinkInput = document.getElementById('imageLinkInput');

    const directUrl = assetData.lubricationMapUrl;
    
    // Mostrar/Ocultar imagen y mensaje
    if (directUrl) {
        imageElement.src = directUrl;
        imageElement.style.display = 'block';
        noImageMsg.style.display = 'none';
    } else {
        imageElement.src = '';
        imageElement.style.display = 'none';
        noImageMsg.style.display = 'block';
    }
    
    // Siempre limpiar el input al abrir para que el usuario pegue un nuevo link.
    imageLinkInput.value = '';
    
    document.getElementById('imageModal').style.display = 'block';
}

function closeImageModal() {
    document.getElementById('imageModal').style.display = 'none';
    document.getElementById('assetLubricationImage').src = ''; // Limpiar la fuente
    
    // Vuelve a renderizar la lista de tareas para actualizar el botón "View Map"
    if (document.getElementById('taskModal').style.display === 'block' && currentAssetId) {
        renderTaskList(currentAssetId);
    }
}

// 🔑 NUEVA FUNCIÓN: Guarda el nuevo enlace de la imagen
function saveNewImageLink() {
    const assetId = document.getElementById('currentImageAssetId').value;
    const sharedLink = document.getElementById('imageLinkInput').value.trim();
    
    if (!sharedLink) {
        alert("Please paste the Google Drive shared link.");
        return;
    }

    // Usar la utilidad para convertir el enlace
    const directUrl = convertDriveLinkToDirect(sharedLink);

    if (directUrl) {
        // 1. Guardar la URL DIRECTA en la estructura de datos
        lubricationData[assetId].lubricationMapUrl = directUrl;
        saveData();
        
        // 2. Mostrar la imagen en el modal
        const imageElement = document.getElementById('assetLubricationImage');
        imageElement.src = directUrl;
        imageElement.style.display = 'block';
        document.getElementById('noImageMessage').style.display = 'none';
        
        // 3. Limpiar el input
        document.getElementById('imageLinkInput').value = '';
        
        alert("Image link successfully saved and loaded! Remember to ensure the file is shared publicly.");
        
        // Vuelve a abrir el modal de imagen para reflejar el cambio si el usuario quiere editar de nuevo.
        openImageModal(assetId); 
    } else {
        alert("Invalid Google Drive link format. Please ensure it is the shared link (file/d/ID/view).");
    }
}

// Renders the task list in the modal (Con encabezado y input de horas)
function renderTaskList(assetId) {
    const listContainer = document.getElementById('taskList');
    listContainer.innerHTML = '';
    const tasks = lubricationData[assetId].tasks || []; 
    const assetMapUrl = lubricationData[assetId].lubricationMapUrl;

    // --- ENCABEZADO DE BOTONES Y TÍTULO ---
    const headerHtml = `
        <div class="modal-header">
            <button id="openAddTaskModalBtn" onclick="openAddTaskModal()">➕ Add New Task</button>
            <button id="openImageMapBtn" 
                    class="edit-task-btn" 
                    title="${assetMapUrl ? 'View/Edit Lubrication Map' : 'Add Lubrication Map'}"
                    onclick="openImageModal('${assetId}')">
                🖼️ ${assetMapUrl ? 'View/Edit Map' : 'Add Map'}
            </button>
        </div>
    `;

    // --- ENCABEZADO DE LA TABLA ---
    const tableHeaderHtml = `
        <div class="task-table-header">
            <div class="header-description">Task Description</div>
            <div class="header-freq">Freq.</div>
            <div class="header-last">Last Completed</div>
            <div class="header-next">Next Due</div>
            <div class="header-hours">Hours</div>
            <div class="header-actions">Actions</div>
        </div>
    `;

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = tableHeaderHtml;

    const taskListUl = document.createElement('ul');
    taskListUl.id = 'task-list-items'; 

    tasks.forEach((task, index) => {
        const nextDueDate = calculateNextDueDate(task.lastCompleted, task.frequency, task.scheduleStartDay);
        const nextDueDateStr = formatDate(nextDueDate);
        
        const isPendingOrOverdue = isTaskDueTodayOrPending(nextDueDate);
        
        const lastCompletedDate = task.lastCompleted ? task.lastCompleted : 'N/A';
        const hoursValue = task.hoursSpent !== null ? task.hoursSpent : ''; 

        const listItem = document.createElement('li');
        listItem.className = `task-item ${task.completed ? 'completed-task' : ''}`;
        
        let dueStatusHTML;
        if (task.completed) {
            dueStatusHTML = ''; 
        } else if (isPendingOrOverdue) {
            dueStatusHTML = `<button class="skip-task-btn" onclick="skipTask('${assetId}', ${index})">🚫 Skip Today</button>`;
        } else {
            const windowStart = new Date(nextDueDate.getTime() - (7 * ONE_DAY_MS));
            const windowStartStr = formatDate(windowStart);
            dueStatusHTML = `<span class="blocked-message">Window starts: ${windowStartStr}</span>`;
        }
        
        const skipCountDisplay = (task.skipCount && task.skipCount > 0) ? 
            `<span style="color: #e67e22; font-weight: bold;"> (Skipped: ${task.skipCount})</span>` : 
            '';

        listItem.innerHTML = `
            <div class="task-description-cell">
                <input type="checkbox" data-index="${index}" ${task.completed ? 'checked' : ''} 
                    onchange="toggleTaskCompletion('${assetId}', ${index}, this.checked)" 
                    ${!isPendingOrOverdue ? 'disabled' : ''}>
                <span class="task-description-text">${task.text}${skipCountDisplay}</span>
            </div>
            <div class="task-detail-item task-freq">${task.frequency} ${task.scheduleStartDay > 0 ? `(Day ${task.scheduleStartDay})` : ''}</div>
            <div class="task-detail-item">${lastCompletedDate}</div>
            <div class="task-detail-item">${nextDueDateStr}</div>
            <div class="task-detail-item task-hours-input-container">
                <input type="number" 
                        class="hours-input"
                        data-index="${index}"
                        placeholder="0.0" 
                        value="${hoursValue}"
                        min="0.1"
                        step="0.1"
                        ${task.completed ? 'disabled' : ''}>
            </div>
            <div class="task-actions-group">
                ${dueStatusHTML}
                <button class="edit-task-btn" onclick="openEditModal('${assetId}', ${index})">🖊️</button>
                <button class="delete-task-btn" onclick="deleteTask('${assetId}', ${index})">🗑️</button>
            </div>
        `;
        taskListUl.appendChild(listItem);
    });

    listContainer.innerHTML = headerHtml;
    listContainer.appendChild(tempDiv);
    listContainer.appendChild(taskListUl);
}


// ====================================================================
// --- DATA MANIPULATION FUNCTIONS ---
// ====================================================================

// ... (Resto de las funciones: addTask, toggleTaskCompletion, skipTask, saveEditedTask, deleteTask, updateAssetProgress, etc. sin cambios en su lógica principal de tareas) ...

function addTask() {
    const assetId = document.getElementById('addTaskAssetId').value;
    const text = document.getElementById('newTaskText').value.trim();
    const frequency = document.getElementById('newTaskFrequency').value;
    const startDayInput = document.getElementById('newTaskStartDay');
    
    const scheduleStartDay = (frequency.slice(-1) === 'Y') 
        ? (parseInt(startDayInput.value) || 0) 
        : 0; 

    if (!text) {
        alert("Please enter a task description.");
        return;
    }

    if (text) {
        const newTask = {
            text: text,
            frequency: frequency,
            lastCompleted: null,
            completed: false,
            scheduleStartDay: scheduleStartDay,
            hoursSpent: null,
            skipCount: 0
        };
        
        if (lubricationData[assetId] && lubricationData[assetId].tasks) {
            lubricationData[assetId].tasks.push(newTask);
        } else {
             lubricationData[assetId] = { 
                 tasks: [newTask], 
                 lubricationMapUrl: null 
             }; 
        }
        
        saveData();
        
        closeAddTaskModal();
        
        renderTaskList(assetId); 
        updateAssetProgress(assetId);
        updateOverallProgressChart(); 
    }
}

function toggleTaskCompletion(assetId, index, isChecked) {
    const task = lubricationData[assetId].tasks[index]; 
    const taskElement = document.querySelector(`#task-list-items li:nth-child(${index + 1})`); 
    const hoursInput = taskElement ? taskElement.querySelector('.hours-input') : null;
    
    if (!hoursInput) return;

    const nextDueDate = calculateNextDueDate(task.lastCompleted, task.frequency, task.scheduleStartDay);
    const isPendingOrOverdue = isTaskDueTodayOrPending(nextDueDate);

    if (!isPendingOrOverdue && isChecked) {
        document.querySelector(`#task-list-items input[data-index="${index}"]`).checked = false;
        return; 
    }

    if (isChecked) {
        const hours = parseFloat(hoursInput.value);
        
        if (isNaN(hours) || hours <= 0) {
            alert("Please enter hours spent (greater than 0) before completing the task.");
            document.querySelector(`#task-list-items input[data-index="${index}"]`).checked = false; 
            return;
        }
        
        task.completed = true;
        task.lastCompleted = formatDate(today);
        task.hoursSpent = hours; 
        
        task.skipCount = 0; 
        
        hoursInput.disabled = true;
    } else {
        task.completed = false;
        task.hoursSpent = null; 
        hoursInput.disabled = false; 
    }
    
    saveData();
    renderTaskList(assetId); 
    updateAssetProgress(assetId);
    updateOverallProgressChart(); 
}

function skipTask(assetId, index) {
    const task = lubricationData[assetId].tasks[index]; 
    
    if (confirm(`WARNING: Are you sure you want to SKIP the task "${task.text}" for today? The next due date will be advanced.`)) {
        
        task.skipCount = (task.skipCount || 0) + 1; 
        
        task.completed = false; 
        task.lastCompleted = formatDate(today); 
        task.hoursSpent = null; 
        
        saveData();
        renderTaskList(assetId); 
        updateAssetProgress(assetId);
        updateOverallProgressChart(); 
    }
}

function saveEditedTask() {
    const assetId = document.getElementById('editCurrentAssetId').value;
    const index = parseInt(document.getElementById('editCurrentTaskIndex').value);
    
    const task = lubricationData[assetId].tasks[index]; 
    task.text = document.getElementById('editTaskText').value.trim();
    task.frequency = document.getElementById('editTaskFrequency').value;
    task.lastCompleted = document.getElementById('editLastCompleted').value || null;
    task.scheduleStartDay = parseInt(document.getElementById('editStartDay').value) || 0; 
    
    task.completed = false; 
    task.hoursSpent = null; 

    saveData();
    closeEditModal();
    openTaskModal(assetId); 
    updateAssetProgress(assetId);
    updateOverallProgressChart(); 
}

function deleteTask(assetId, index) {
    if (confirm(`Are you sure you want to delete the task: "${lubricationData[assetId].tasks[index].text}"?`)) { 
        lubricationData[assetId].tasks.splice(index, 1); 
        saveData();
        renderTaskList(assetId);
        updateAssetProgress(assetId);
        updateOverallProgressChart(); 
    }
}


function updateAssetProgress(assetId) {
    const assetBlock = document.getElementById(assetId);
    if (!assetBlock) return;

    assetBlock.querySelectorAll('.progress-bar-container').forEach(el => el.remove());
    assetBlock.classList.remove('status-ok', 'status-overdue', 'status-completed', 'has-progress'); 

    const tasks = lubricationData[assetId].tasks || []; 
    const totalTasks = tasks.length;
    
    const activeTasks = tasks.filter(task => {
        const nextDueDate = calculateNextDueDate(task.lastCompleted, task.frequency, task.scheduleStartDay); 
        return isTaskDueTodayOrPending(nextDueDate);
    });

    const strictlyOverdueTasks = tasks.filter(task => {
        const nextDueDate = calculateNextDueDate(task.lastCompleted, task.frequency, task.scheduleStartDay); 
        return isTaskStrictlyOverdue(nextDueDate) && !task.completed; 
    });

    const totalActive = activeTasks.length;
    const completedActive = activeTasks.filter(task => task.completed).length;

    let assetStatusColor = '#ccc'; 
    
    if (totalTasks === 0) {
        assetBlock.style.boxShadow = `0 0 8px 1px #ccc`;
        return; 
    }
    
    if (totalActive === 0) {
        assetStatusColor = '#3498db'; 
        assetBlock.classList.add('status-ok');
    } else {
        if (strictlyOverdueTasks.length > 0) {
            assetStatusColor = '#e74c3c'; 
            assetBlock.classList.add('status-overdue');
            assetBlock.classList.add('has-progress');
        } 
        else if (completedActive === totalActive) {
            assetStatusColor = '#2ecc71'; 
            assetBlock.classList.add('status-completed');
            assetBlock.classList.add('has-progress');
        } 
        else {
            assetStatusColor = '#3498db'; 
            assetBlock.classList.add('status-ok');
            assetBlock.classList.add('has-progress');
        }
    }
    
    assetBlock.style.boxShadow = `0 0 8px 1px ${assetStatusColor}`;

    if (totalActive === 0) {
        return; 
    }
    
    const percentage = Math.round((completedActive / totalActive) * 100);
    
    const container = document.createElement('div');
    container.className = 'progress-bar-container';

    const bar = document.createElement('div');
    bar.className = 'progress-bar';
    bar.style.width = `${percentage}%`;

    let colorClass; 
    
    if (percentage < 50 && percentage > 0) {
        colorClass = 'due'; 
    } else {
        colorClass = 'ok'; 
    }
    bar.classList.add(colorClass);

    const text = document.createElement('span');
    text.className = 'progress-text';
    text.textContent = `${percentage}%`; 
    
    container.appendChild(bar);
    bar.appendChild(text); 
    assetBlock.appendChild(container);
}

function calculateOverallProgress() {
    let totalDefinedTasks = 0;
    let totalCompletedTasks = 0;

    for (const assetId in lubricationData) {
        const tasks = lubricationData[assetId].tasks || []; 
        totalDefinedTasks += tasks.length;
        totalCompletedTasks += tasks.filter(task => task.completed).length;
    }

    if (totalDefinedTasks === 0) {
        return { completed: 100, pending: 0 }; 
    }

    const completedPercentage = Math.round((totalCompletedTasks / totalDefinedTasks) * 100);
    const pendingPercentage = 100 - completedPercentage;

    return { completed: completedPercentage, pending: pendingPercentage };
}

function updateOverallProgressChart() {
    const progress = calculateOverallProgress();
    const ctx = document.getElementById('overallProgressChart').getContext('2d');
    
    if (overallChartInstance) {
        overallChartInstance.destroy();
    }

    const overallPercentage = progress.completed;
    
    const percentElement = document.getElementById('overallPercentageText');
    if (percentElement) {
        percentElement.textContent = `${overallPercentage}%`;
    }
    
    overallChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Completed', 'Pending'],
            datasets: [{
                data: [progress.completed, progress.pending],
                backgroundColor: [
                    '#2ecc71', 
                    '#e0e0e0' 
                ],
                borderColor: '#ffffff', 
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%', 
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.label}: ${context.raw}%`
                    }
                },
            }
        }
    });
}

function generateLubricationReport() {
    if (!window.jspdf) {
        alert("Error: jsPDF library not loaded. Please check the index.html script tag.");
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let y = 10;
    const lineHeight = 7;
    const pageHeight = doc.internal.pageSize.height;

    doc.setFontSize(18);
    doc.text("Lubrication Site Report", 10, y);
    y += lineHeight * 2;

    doc.setFontSize(12);
    doc.text(`Report Date: ${formatDate(today)}`, 10, y);
    y += lineHeight * 2;
    
    let totalHoursSpent = 0;
    for (const assetId in lubricationData) {
        const tasks = lubricationData[assetId].tasks || []; 
        tasks.forEach(task => {
            if (task.hoursSpent !== null) {
                totalHoursSpent += parseFloat(task.hoursSpent);
            }
        });
    }
    
    doc.text(`Total Hours Logged: ${totalHoursSpent.toFixed(1)} hrs (All Time)`, 10, y);
    y += lineHeight * 2;


    const assetKeys = Object.keys(lubricationData);

    assetKeys.forEach(assetId => {
        const tasks = lubricationData[assetId].tasks; 
        const assetBlock = document.getElementById(assetId);
        const assetName = assetBlock ? assetBlock.firstChild.textContent.trim().split('\n')[0] : assetId.replace(/-/g, ' ').toUpperCase(); 

        if (y > pageHeight - 30) {
            doc.addPage();
            y = 10;
        }

        doc.setFontSize(14);
        doc.text(`Asset: ${assetName}`, 10, y);
        y += lineHeight;

        if (tasks.length === 0) {
            doc.setFontSize(10);
            doc.text("     - No tasks defined.", 10, y);
            y += lineHeight;
        } else {
            tasks.forEach(task => {
                if (y > pageHeight - 10) {
                    doc.addPage();
                    y = 10;
                    doc.setFontSize(14);
                    doc.text(`Asset: ${assetName} (cont.)`, 10, y);
                    y += lineHeight;
                }

                const nextDueDate = calculateNextDueDate(task.lastCompleted, task.frequency, task.scheduleStartDay);
                const nextDueDateStr = formatDate(nextDueDate);
                const isDue = isTaskDueTodayOrPending(nextDueDate); 
                
                const status = isDue ? "DUE" : "OK";
                const completedStr = task.completed ? "COMPLETED" : "PENDING";
                const completedDate = task.lastCompleted || "N/A";
                const offsetDay = task.scheduleStartDay > 0 ? `(Day ${task.scheduleStartDay})` : '';
                const hoursSpent = task.hoursSpent !== null ? `${task.hoursSpent} hrs` : "N/A";
                const skipCountReport = (task.skipCount && task.skipCount > 0) ? ` | Skips: ${task.skipCount}` : ''; 

                doc.setFontSize(10);
                doc.text(`     - Task: ${task.text}`, 10, y);
                doc.text(`[${status} - ${completedStr}]`, 120, y);
                y += lineHeight * 0.7;
                doc.text(`     Freq: ${task.frequency} ${offsetDay} | Last: ${completedDate} | Next Due: ${nextDueDateStr} | Hours: ${hoursSpent}${skipCountReport}`, 15, y); 
                y += lineHeight;
            });
        }
        y += lineHeight * 0.5;
    });

    doc.save("Lubrication_Report.pdf");
}

function initializeMap() {
    today = new Date("2025-11-23"); 
    
    const assetBlocks = document.querySelectorAll('.asset-block');
    assetBlocks.forEach(block => {
        block.addEventListener('click', () => openTaskModal(block.id));
        updateAssetProgress(block.id); 
    });
    updateOverallProgressChart(); 
    
    const taskModal = document.getElementById('taskModal');
    const editTaskModal = document.getElementById('editTaskModal');
    const addTaskModal = document.getElementById('addTaskModal');
    const imageModal = document.getElementById('imageModal'); 

    window.addEventListener('click', (event) => {
        if (event.target === taskModal) {
            closeModal();
        } else if (event.target === editTaskModal) {
            closeEditModal();
        } else if (event.target === addTaskModal) {
            closeAddTaskModal();
        } else if (event.target === imageModal) { 
            // Cierra el modal de imagen al hacer clic fuera
            closeImageModal();
        }
    });
}

document.addEventListener('DOMContentLoaded', initializeMap);
