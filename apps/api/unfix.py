import os
import glob

base_dir = '/Users/dasuncharuka/Documents/projects/vet project /apps/api/src'

replacements = {
    'this.prisma.healthRecord': 'this.prisma.medicalRecord',
    'owner: {': 'petOwner: {',
    'owner: true': 'petOwner: true',
    '.owner.': '.petOwner.',
    'apt.owner': 'apt.petOwner',
    'vet.rating': 'vet.averageRating',
    
    # Vaccination fixes inverse
    'vetId: vet.id': 'veterinarianId: vet.id',
    'vaccination.vetId': 'vaccination.veterinarianId',
    'administeredDate:': 'dateAdministered:',
}

files = glob.glob(base_dir + '/**/*.ts', recursive=True)

for file in files:
    with open(file, 'r') as f:
        content = f.read()
    
    new_content = content
    for old, new in replacements.items():
        if old in new_content:
            new_content = new_content.replace(old, new)
            
    if new_content != content:
        with open(file, 'w') as f:
            f.write(new_content)
        print(f"Reverted {file}")

