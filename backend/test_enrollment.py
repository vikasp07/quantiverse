import json
import os
from flask import Flask, jsonify

# Test script for enrollment functionality
def test_enrollments():
    """Test function to verify enrollments.json structure and content"""
    
    enrollments_file = os.path.join(os.path.dirname(__file__), 'enrollments.json')
    
    try:
        with open(enrollments_file, 'r') as f:
            enrollments = json.load(f)
        
        print(f"✅ Successfully loaded {len(enrollments)} enrollments")
        
        # Test data structure
        required_fields = ['id', 'user_id', 'simulation_id', 'enrolled_at', 'status', 'progress', 'student_info']
        
        for i, enrollment in enumerate(enrollments):
            print(f"\nTesting enrollment {i+1}:")
            
            for field in required_fields:
                if field in enrollment:
                    print(f"  ✅ {field}: {enrollment[field]}")
                else:
                    print(f"  ❌ Missing field: {field}")
                    
        return True
        
    except FileNotFoundError:
        print("❌ enrollments.json file not found")
        return False
    except json.JSONDecodeError as e:
        print(f"❌ Invalid JSON format: {e}")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def get_enrollment_by_user(user_id):
    """Get all enrollments for a specific user"""
    try:
        with open('enrollments.json', 'r') as f:
            enrollments = json.load(f)
        
        user_enrollments = [e for e in enrollments if e['user_id'] == user_id]
        return user_enrollments
    except Exception as e:
        print(f"Error getting user enrollments: {e}")
        return []

def get_enrollment_by_simulation(simulation_id):
    """Get all enrollments for a specific simulation"""
    try:
        with open('enrollments.json', 'r') as f:
            enrollments = json.load(f)
        
        sim_enrollments = [e for e in enrollments if e['simulation_id'] == simulation_id]
        return sim_enrollments
    except Exception as e:
        print(f"Error getting simulation enrollments: {e}")
        return []

if __name__ == "__main__":
    print("🧪 Testing Enrollment System...")
    
    # Test basic loading
    if test_enrollments():
        print("\n🎉 Basic enrollment tests passed!")
        
        # Test specific queries
        print("\n📊 Testing queries...")
        
        # Test user query
        user_enrollments = get_enrollment_by_user("12345678-1234-1234-1234-123456789012")
        print(f"User enrollments found: {len(user_enrollments)}")
        
        # Test simulation query  
        sim_enrollments = get_enrollment_by_simulation("6daf31a1-1163-4a1a-a5aa-42b9d8c41358")
        print(f"Simulation enrollments found: {len(sim_enrollments)}")
        
    else:
        print("\n❌ Enrollment tests failed!")