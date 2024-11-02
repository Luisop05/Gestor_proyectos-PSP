// Almacenar los proyectos agregados
const projects = [];
let progressChart;  // Variable para el gráfico

document.getElementById('project-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const projectName = document.getElementById('project-name').value;
    const projectDescription = document.getElementById('project-description').value;
    const projectProgress = parseInt(document.getElementById('project-progress').value);

    // Agrega el nuevo proyecto al array
    projects.push({
        name: projectName,
        description: projectDescription,
        progress: projectProgress,
        tasks: []
    });

    // Limpiar el formulario
    event.target.reset();

    // Actualizar la lista de proyectos y el gráfico
    updateProjectList();
    renderChart();
});

function updateProjectList() {
    const projectList = document.getElementById('project-list');
    projectList.innerHTML = ''; // Limpiar la lista actual

    projects.forEach((project, index) => {
        const li = document.createElement('li');
        li.className = 'project-item';
        li.innerHTML = `<strong>${project.name}</strong>: ${project.description} 
                        (Progreso: <input type="number" min="0" max="100" value="${project.progress}" data-index="${index}" />
                        %)<br>
                        <label for="task-name-${index}">Agregar Tarea:</label>
                        <input type="text" id="task-name-${index}" />
                        <button type="button" onclick="addTask(${index})">Agregar</button>
                        <table class="task-table" id="task-table-${index}">
                            <thead>
                                <tr>
                                    <th>Tarea</th>
                                    <th>Completada</th>
                                </tr>
                            </thead>
                            <tbody class="task-list" id="task-list-${index}"></tbody>
                        </table>`;
        projectList.appendChild(li);
        
        // Mostrar tareas
        displayTasks(project.tasks, index);
        
        // Manejar el cambio de progreso
        li.querySelector('input[type="number"]').addEventListener('change', function() {
            const newProgress = parseInt(this.value);
            if (!isNaN(newProgress) && newProgress >= 0 && newProgress <= 100) {
                projects[this.dataset.index].progress = newProgress; // Actualizar el progreso
                renderChart(); // Renderizar de nuevo el gráfico
            }
        });
    });
}

function addTask(projectIndex) {
    const taskInput = document.getElementById(`task-name-${projectIndex}`);
    const taskName = taskInput.value;

    if (taskName) {
        projects[projectIndex].tasks.push({ name: taskName, completed: false });
        taskInput.value = ''; // Limpiar el input de tarea
        displayTasks(projects[projectIndex].tasks, projectIndex); // Actualizar la lista de tareas
        updateProjectProgress(projectIndex); // Actualizar el progreso del proyecto
    }
}

function displayTasks(tasks, projectIndex) {
    const taskListDiv = document.getElementById(`task-list-${projectIndex}`);
    taskListDiv.innerHTML = ''; // Limpiar la lista actual

    tasks.forEach((task, taskIndex) => {
        const taskItem = document.createElement('tr');
        taskItem.innerHTML = `
            <td>${task.name}</td>
            <td>
                <input type="checkbox" id="task-${projectIndex}-${taskIndex}" onchange="toggleTaskCompletion(${projectIndex}, ${taskIndex})" ${task.completed ? 'checked' : ''} />
            </td>
        `;
        taskListDiv.appendChild(taskItem);
    });
}

function toggleTaskCompletion(projectIndex, taskIndex) {
    const task = projects[projectIndex].tasks[taskIndex];
    task.completed = !task.completed; // Cambiar estado
    updateProjectProgress(projectIndex); // Actualizar el progreso del proyecto
}

function updateProjectProgress(projectIndex) {
    const totalTasks = projects[projectIndex].tasks.length;
    const completedTasks = projects[projectIndex].tasks.filter(task => task.completed).length;

    const newProgress = totalTasks === 0 ? 0 : Math.floor((completedTasks / totalTasks) * 100); // Calcular nuevo progreso
    projects[projectIndex].progress = newProgress; // Actualizar el progreso

    // Forzar la actualización del campo de entrada del progreso
    const progressInput = document.querySelector(`input[data-index='${projectIndex}']`);
    if (progressInput) {
        progressInput.value = newProgress; // Actualiza el valor en el input visible
    }

    renderChart(); // Renderizar el gráfico
}

function renderChart() {
    const ctx = document.getElementById('progress-chart').getContext('2d');

    // Extraer nombres de proyectos para etiquetas
    const projectNames = projects.map(project => project.name);
    
    // Obtener el progreso de cada proyecto
    const projectProgress = projects.map(project => project.progress);

    // Si el gráfico ya existe, destrúyelo para crear uno nuevo
    if (progressChart) {
        progressChart.destroy();
    }

    // Crear gráfico
    progressChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: projectNames,
            datasets: [{
                label: 'Progreso de Proyectos (%)',
                data: projectProgress,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Progreso (%)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Proyectos'
                    }
                }
            },
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Gráfico de Progreso de Proyectos'
                }
            }
        }
    });
}
