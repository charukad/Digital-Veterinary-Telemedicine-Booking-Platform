import os
import glob
import re

base_dir = '/Users/dasuncharuka/Documents/projects/vet project /apps/api/src'

files = glob.glob(base_dir + '/**/*.ts', recursive=True)

for file in files:
    with open(file, 'r') as f:
        content = f.read()
    
    new_content = content
    
    new_content = new_content.replace('this.prisma.medicalRecord', 'this.prisma.healthRecord')
    new_content = new_content.replace('petOwner: {', 'owner: {')
    new_content = new_content.replace('petOwner: true', 'owner: true')
    new_content = new_content.replace('.petOwner.', '.owner.')
    new_content = new_content.replace('apt.petOwner', 'apt.owner')
    new_content = new_content.replace('vet.averageRating', 'vet.rating')
    
    # Vaccination fixes
    new_content = new_content.replace('veterinarianId: vet.id', 'vetId: vet.id')
    new_content = new_content.replace('vaccination.veterinarianId', 'vaccination.vetId')
    new_content = new_content.replace('dateAdministered:', 'administeredDate:')
    
    # In injections/services, when referencing MedicalRecord it should be HealthRecord
    # but that might break imports or type names if they are named MedicalRecord
    
    if new_content != content:
        with open(file, 'w') as f:
            f.write(new_content)
        print(f"Fixed {file}")
