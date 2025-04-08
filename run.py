import os
import sys
import subprocess

if __name__ == "__main__":
    # Run uvicorn with python3.11
    cmd = [
        "python3.11", "-m", "uvicorn", 
        "api.main:app", 
        "--host", "0.0.0.0", 
        "--port", "3000", 
        "--reload"
    ]
    
    subprocess.run(cmd)