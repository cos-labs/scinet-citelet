from setuptools import setup, find_packages

setup(
    name='pytelet',
    version='0.1',
    packages=find_packages(),
    package_data={'' : ['tests/fixtures/*.html', 'tests/fixtures/*.json']},
    include_package_data=True,
)
