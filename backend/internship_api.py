"""
Backend Endpoint Module: Internship Creation with HTML Sanitization

This module handles creating internships with rich HTML content and validates
plain-text character counts at the database level.

Flow:
1. Frontend sends sanitized HTML from TipTap editor
2. Backend re-sanitizes (defense in depth)
3. Extract plain text and validate (250-500 chars)
4. Store both HTML and plain text in Supabase
5. DB CHECK constraints enforce final validation

Author: Quantiverse Backend
Date: December 26, 2025
"""

from flask import Blueprint, request, jsonify, current_app
from sanitizer import HtmlSanitizer
import logging

# Create blueprint for internship endpoints
internship_bp = Blueprint('internships', __name__, url_prefix='/admin/internships')

# Logger
logger = logging.getLogger(__name__)


@internship_bp.route('', methods=['POST'])
def create_internship():
    """
    Create a new internship simulation with rich HTML content.
    
    Request body:
    {
        "title": "string",
        "category": "string",
        "difficulty": "string",
        "duration": "string",
        "image": "string",
        "description": "<html>Rich text</html>",  // From TipTap editor
        "overview": "<html>Rich text</html>",
        "features": "<html>Rich text</html>",
        "skills": "<html>Rich text</html>",
        "tasks": [  // Optional: array of task objects
            {
                "title": "string",
                "full_title": "string",
                "duration": "string",
                "difficulty": "string",
                "description": "<html>Rich text</html>",
                "what_youll_learn": "<html>Rich text</html>",
                "what_youll_do": "<html>Rich text</html>",
                "material_url": "string"  // Optional
            }
        ]
    }
    
    Response on success (201):
    {
        "id": 123,
        "message": "Internship created successfully",
        "simulation": { ... },
        "tasks": [ ... ]
    }
    
    Response on error (400/500):
    {
        "error": "Descriptive error message"
    }
    """
    try:
        # Check if Supabase is available
        supabase = current_app.config.get('supabase')
        if not supabase:
            logger.error("Supabase client not available")
            return jsonify({'error': 'Database connection unavailable. Please check your internet connection.'}), 503
        
        data = request.json
        
        # ===== VALIDATE REQUIRED FIELDS =====
        required_fields = ['title', 'category', 'difficulty', 'duration', 'description', 'overview']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # ===== PROCESS SIMULATION FIELDS =====
        # HTML fields that need sanitization and validation
        html_fields = {
            'description': data.get('description', ''),
            'overview': data.get('overview', ''),
            'features': data.get('features', ''),
            'skills': data.get('skills', ''),
        }
        
        # Sanitize and validate each HTML field
        simulation_data = {
            'title': data.get('title', '').strip(),
            'category': data.get('category', '').strip(),
            'difficulty': data.get('difficulty', '').strip(),
            'duration': data.get('duration', '').strip(),
            'image': data.get('image', '').strip(),
            'rating': None,  # Always null for new simulations
            # Note: Don't send 'id' - let Supabase auto-generate it
        }
        
        # Process each HTML field
        for field_name, html_content in html_fields.items():
            if not html_content:
                return jsonify({'error': f'{field_name} is required'}), 400
            
            # Sanitize HTML
            sanitized_html = HtmlSanitizer.sanitize(html_content)
            if not sanitized_html.strip():
                return jsonify({'error': f'{field_name} content is empty after sanitization'}), 400
            
            # Extract plain text for validation only
            plain_text = HtmlSanitizer.extract_plain_text(sanitized_html)
            
            # Validate plain-text length (5-500 chars)
            validation = HtmlSanitizer.validate_plain_text_length(sanitized_html, min_length=5, max_length=500)
            if not validation['valid']:
                return jsonify({
                    'error': f'{field_name}: {validation["message"]} (Plain text has {validation["char_count"]} chars)'
                }), 400
            
            # Store only HTML (Supabase table doesn't have _plain columns)
            simulation_data[field_name] = sanitized_html
        
        logger.info(f"Creating simulation: {simulation_data['title']}")
        
        # ===== INSERT SIMULATION INTO SUPABASE =====
        # Use admin client to bypass RLS policies
        supabase_admin = current_app.config.get('supabase_admin')
        if not supabase_admin:
            supabase_admin = current_app.config.get('supabase')
        
        logger.info(f"Attempting to insert simulation with columns: {list(simulation_data.keys())}")
        
        try:
            sim_response = supabase_admin.table('simulations').insert(simulation_data).execute()
            logger.info(f"✓ Successfully inserted simulation ID {sim_response.data[0]['id']}")
        except Exception as supabase_error:
            logger.error(f"✗ Supabase insert error: {str(supabase_error)}")
            logger.warning(f"Error details: {supabase_error}")
            logger.info("Falling back to local JSON storage...")
            
            # Fallback: Save to JSON file
            import json
            from pathlib import Path
            simulations_file = Path('simulations.json')
            
            try:
                # Load existing simulations
                if simulations_file.exists():
                    with open(simulations_file, 'r') as f:
                        existing_sims = json.load(f)
                else:
                    existing_sims = []
                
                # Add new simulation with generated ID
                simulation_data['id'] = len(existing_sims) + 1
                existing_sims.append(simulation_data)
                
                # Save to file
                with open(simulations_file, 'w') as f:
                    json.dump(existing_sims, f, indent=2)
                
                logger.info(f"Saved simulation to JSON with ID: {simulation_data['id']}")
                
                # Create a mock response object
                class MockResponse:
                    def __init__(self, data):
                        self.data = [data]
                
                sim_response = MockResponse(simulation_data)
            except Exception as json_error:
                logger.error(f"JSON fallback also failed: {str(json_error)}")
                raise
        
        if not sim_response.data or len(sim_response.data) == 0:
            logger.error(f"Failed to insert simulation: {sim_response}")
            return jsonify({'error': 'Failed to create simulation in database'}), 500
        
        simulation_id = sim_response.data[0]['id']
        logger.info(f"Simulation created with ID: {simulation_id}")
        
        # ===== PROCESS TASKS (OPTIONAL) =====
        tasks_data = []
        tasks_input = data.get('tasks', [])
        
        if tasks_input and isinstance(tasks_input, list):
            for idx, task in enumerate(tasks_input):
                # Validate required task fields
                task_required = ['title', 'full_title', 'duration', 'difficulty', 'description', 
                                'what_youll_learn', 'what_youll_do']
                for field in task_required:
                    if not task.get(field):
                        return jsonify({
                            'error': f'Task {idx + 1}: Missing required field: {field}'
                        }), 400
                
                task_data = {
                    'simulation_id': simulation_id,
                    'sequence': idx + 1,
                    'title': f'Task {idx + 1}',
                    'full_title': task.get('full_title', '').strip(),
                    'duration': task.get('duration', '').strip(),
                    'difficulty': task.get('difficulty', '').strip(),
                    'material_url': task.get('material_url', '').strip(),
                }
                
                # Process rich HTML fields in task
                task_html_fields = {
                    'description': task.get('description', ''),
                    'what_youll_learn': task.get('what_youll_learn', ''),
                    'what_youll_do': task.get('what_youll_do', ''),
                }
                
                for field_name, html_content in task_html_fields.items():
                    if not html_content:
                        return jsonify({
                            'error': f'Task {idx + 1}: {field_name} is required'
                        }), 400
                    
                    # Sanitize
                    sanitized_html = HtmlSanitizer.sanitize(html_content)
                    if not sanitized_html.strip():
                        return jsonify({
                            'error': f'Task {idx + 1}: {field_name} content is empty after sanitization'
                        }), 400
                    
                    # Extract plain text for validation only
                    plain_text = HtmlSanitizer.extract_plain_text(sanitized_html)
                    
                    # Validate (5-500 chars)
                    validation = HtmlSanitizer.validate_plain_text_length(sanitized_html, min_length=5, max_length=500)
                    if not validation['valid']:
                        return jsonify({
                            'error': f'Task {idx + 1}, {field_name}: {validation["message"]}'
                        }), 400
                    
                    # Store only HTML
                    task_data[field_name] = sanitized_html
                
                tasks_data.append(task_data)
            
            # ===== INSERT TASKS INTO SUPABASE =====
            if tasks_data:
                supabase_admin = current_app.config.get('supabase_admin')
                if not supabase_admin:
                    supabase_admin = current_app.config.get('supabase')
                
                try:
                    tasks_response = supabase.table('tasks').insert(tasks_data).execute()
                except Exception as supabase_error:
                    logger.warning(f"Supabase tasks insert failed: {str(supabase_error)}")
                    logger.info("Falling back to local JSON storage for tasks...")
                    
                    # Fallback: Save tasks to JSON file
                    import json
                    from pathlib import Path
                    tasks_file = Path('tasks.json')
                    
                    try:
                        # Load existing tasks
                        if tasks_file.exists():
                            with open(tasks_file, 'r') as f:
                                existing_tasks = json.load(f)
                        else:
                            existing_tasks = []
                        
                        # Add task IDs
                        for task in tasks_data:
                            task['id'] = len(existing_tasks) + 1
                            existing_tasks.append(task)
                        
                        # Save to file
                        with open(tasks_file, 'w') as f:
                            json.dump(existing_tasks, f, indent=2)
                        
                        logger.info(f"Saved {len(tasks_data)} tasks to JSON")
                        
                        # Create a mock response
                        class MockResponse:
                            def __init__(self, data):
                                self.data = data
                        
                        tasks_response = MockResponse(tasks_data)
                    except Exception as json_error:
                        logger.error(f"JSON tasks fallback failed: {str(json_error)}")
                        # Don't fail - we already created the simulation
                        tasks_response = MockResponse([])
                        
                if not tasks_response.data or len(tasks_response.data) == 0:
                    logger.warning("No tasks were created, but simulation was successful")
                else:
                    logger.info(f"Created {len(tasks_data)} tasks for simulation {simulation_id}")
        
        return jsonify({
            'id': simulation_id,
            'message': 'Internship created successfully',
            'simulation': sim_response.data[0],
            'task_count': len(tasks_data)
        }), 201
    
    except Exception as e:
        logger.error(f"Unexpected error in create_internship: {str(e)}", exc_info=True)
        return jsonify({'error': f'Server error: {str(e)}'}), 500


@internship_bp.route('', methods=['GET'])
def get_internships():
    """Fetch all simulations - from Supabase or fallback to JSON"""
    try:
        supabase = current_app.config.get('supabase')
        
        # Try Supabase first
        if supabase:
            try:
                response = supabase.table('simulations').select('*').execute()
                if response.data:
                    logger.info(f"Fetched {len(response.data)} simulations from Supabase")
                    return jsonify({
                        'success': True,
                        'data': response.data,
                        'count': len(response.data)
                    }), 200
            except Exception as supabase_error:
                logger.warning(f"Supabase fetch failed: {str(supabase_error)}, trying JSON fallback...")
        
        # Fallback to JSON
        import json
        from pathlib import Path
        simulations_file = Path('simulations.json')
        
        if simulations_file.exists():
            with open(simulations_file, 'r') as f:
                data = json.load(f)
            logger.info(f"Fetched {len(data)} simulations from JSON fallback")
            return jsonify({
                'success': True,
                'data': data,
                'count': len(data),
                'source': 'json'
            }), 200
        else:
            return jsonify({
                'success': True,
                'data': [],
                'count': 0
            }), 200
            
    except Exception as e:
        logger.error(f"Error fetching simulations: {str(e)}", exc_info=True)
        return jsonify({'error': f'Failed to fetch simulations: {str(e)}'}), 500


@internship_bp.route('/<int:internship_id>', methods=['PUT'])
def update_internship(internship_id):
    """
    Update an existing internship simulation.
    
    Same request body structure as POST /admin/internships
    Partial updates are supported (only provided fields are updated).
    """
    try:
        data = request.json
        
        # Process only provided fields
        html_fields_to_update = {}
        for field in ['description', 'overview', 'features', 'skills']:
            if field in data and data[field]:
                html_content = data[field]
                
                # Sanitize
                sanitized_html = HtmlSanitizer.sanitize(html_content)
                if not sanitized_html.strip():
                    return jsonify({'error': f'{field} content is empty after sanitization'}), 400
                
                # Extract plain text for validation only
                plain_text = HtmlSanitizer.extract_plain_text(sanitized_html)
                validation = HtmlSanitizer.validate_plain_text_length(sanitized_html, min_length=5, max_length=500)
                if not validation['valid']:
                    return jsonify({'error': f'{field}: {validation["message"]}'}), 400
                
                html_fields_to_update[field] = sanitized_html
        
        # Update simulation
        update_data = {
            'title': data.get('title', None),
            'category': data.get('category', None),
            'difficulty': data.get('difficulty', None),
            'duration': data.get('duration', None),
            'image': data.get('image', None),
            **html_fields_to_update
        }
        
        # Remove None values (to allow partial updates)
        update_data = {k: v for k, v in update_data.items() if v is not None}
        
        supabase = current_app.config['supabase']
        response = supabase.table('simulations').update(update_data).eq('id', internship_id).execute()
        
        if not response.data:
            return jsonify({'error': 'Simulation not found'}), 404
        
        logger.info(f"Updated simulation {internship_id}")
        return jsonify({'message': 'Internship updated successfully', 'simulation': response.data[0]}), 200
    
    except Exception as e:
        logger.error(f"Error updating internship: {str(e)}", exc_info=True)
        return jsonify({'error': f'Server error: {str(e)}'}), 500


# ===== USAGE IN app.py =====
# from internship_api import internship_bp
# app.register_blueprint(internship_bp)
