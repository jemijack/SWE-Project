from ..__init__ import connect, createCursor
import psycopg2
import logging  # More flexible than print statements

# Hard Coded Junction States
J_NEW = 1
J_NOT_STARTED = 2
J_IN_PROGRESS = 3
J_FINISHED = 4

# Hard Coded Layout States
L_NOT_STARTED = 1
L_IN_PROGRESS = 2
L_FINISHED = 3
L_SIMULATION_ERROR = 4
L_SCORE_CALCULATION_ERROR = 5