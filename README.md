
# Mechanical Press-Fit Analysis Web App
Full-stack web application capable of analyzing press-fit designs with both a finite element method and an analytical approach. 

### Feature Demonstration

![UI Overview](https://raw.githubusercontent.com/slehmann1/PressFits/master/SupportingInfo/Interface.PNG)
#### Finite Element Method
Parts can be modelled in one of two ways:

 1. With a two dimensional axisymmetric mesh composed of eight node quadratic elements
 2. With a two dimensional mesh composed of eight node plane stress elements
 
A custom meshing algorithm is implemented to achieve good results with both of these methods. Results have been verified against ANSYS Mechanical; functional tests ensure alignment with these results.
#### Analytical Approach
The analytical solution relies on [Lamé's equations for thick walled cylinders](https://courses.washington.edu/me354a/Thick%20Walled%20Cylinders.pdf). Results obtained through this method should only be relied upon when the walls of both the inner and outer part are considered thick. A general rule of thumb is that walls of a cylinder may be considered thick if they are at least one tenth of the cylinder radius.

### Dependencies

#### Backend
Relies on Django REST framework, numpy, and pytest. 
Calculix is used as the finite element solver, but a custom meshing algorithm is used. 

#### Frontend
Uses React, TypeScript, JQuery, and Bootstrap. 
